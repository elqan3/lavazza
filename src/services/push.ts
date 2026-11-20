import {
  createCipheriv,
  createECDH,
  createHmac,
  createPrivateKey,
  randomBytes,
  sign,
} from "node:crypto";
import { createClient } from "@supabase/supabase-js";

type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

function encodeBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function hmac(key: Buffer, value: Buffer) {
  return createHmac("sha256", key).update(value).digest();
}

function hkdfExpand(prk: Buffer, info: Buffer, length: number) {
  let previous = Buffer.alloc(0);
  let output = Buffer.alloc(0);
  let counter = 1;

  while (output.length < length) {
    previous = hmac(
      prk,
      Buffer.concat([previous, info, Buffer.from([counter])]),
    );
    output = Buffer.concat([output, previous]);
    counter += 1;
  }

  return output.subarray(0, length);
}

function createVapidAuthorization(
  endpoint: string,
  publicKey: string,
  privateKey: string,
  subject: string,
) {
  const publicBytes = decodeBase64Url(publicKey);
  const privateBytes = decodeBase64Url(privateKey);

  if (publicBytes.length !== 65 || publicBytes[0] !== 4 || privateBytes.length !== 32) {
    throw new Error("Invalid VAPID key configuration.");
  }

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: encodeBase64Url(publicBytes.subarray(1, 33)),
    y: encodeBase64Url(publicBytes.subarray(33, 65)),
    d: encodeBase64Url(privateBytes),
  };

  const signingKey = createPrivateKey({ key: jwk, format: "jwk" });
  const audience = new URL(endpoint).origin;
  const header = encodeBase64Url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: subject,
    }),
  );
  const unsignedToken = header + "." + payload;
  const signature = sign("sha256", Buffer.from(unsignedToken), {
    key: signingKey,
    dsaEncoding: "ieee-p1363",
  });

  return "vapid t=" + unsignedToken + "." + signature.toString("base64url") + ", k=" + publicKey;
}

function encryptPushPayload(
  subscription: StoredSubscription,
  payload: string,
) {
  const userPublicKey = decodeBase64Url(subscription.p256dh);
  const authSecret = decodeBase64Url(subscription.auth);

  if (userPublicKey.length !== 65 || userPublicKey[0] !== 4 || authSecret.length < 16) {
    throw new Error("Invalid push subscription keys.");
  }

  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  const serverPublicKey = ecdh.getPublicKey();
  const sharedSecret = ecdh.computeSecret(userPublicKey);

  const authPrk = hmac(authSecret, sharedSecret);
  const info = Buffer.concat([
    Buffer.from("WebPush: info\0"),
    userPublicKey,
    serverPublicKey,
  ]);
  const inputKeyMaterial = hkdfExpand(authPrk, info, 32);

  const salt = randomBytes(16);
  const prk = hmac(salt, inputKeyMaterial);
  const contentEncryptionKey = hkdfExpand(
    prk,
    Buffer.from("Content-Encoding: aes128gcm\0"),
    16,
  );
  const nonce = hkdfExpand(
    prk,
    Buffer.from("Content-Encoding: nonce\0"),
    12,
  );

  const plaintext = Buffer.concat([Buffer.from(payload), Buffer.from([2])]);
  const cipher = createCipheriv("aes-128-gcm", contentEncryptionKey, nonce);
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);

  return Buffer.concat([
    salt,
    recordSize,
    Buffer.from([serverPublicKey.length]),
    serverPublicKey,
    encrypted,
  ]);
}

async function sendWebPush(
  subscription: StoredSubscription,
  payload: string,
  vapid: { publicKey: string; privateKey: string; subject: string },
) {
  const body = encryptPushPayload(subscription, payload);
  const authorization = createVapidAuthorization(
    subscription.endpoint,
    vapid.publicKey,
    vapid.privateKey,
    vapid.subject,
  );

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "60",
      Urgency: "high",
    },
    body,
  });

  if (response.status === 404 || response.status === 410) {
    const error = new Error("Push subscription expired.") as Error & { statusCode?: number };
    error.statusCode = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error("Push service returned HTTP " + response.status);
  }
}

export async function sendStaffOrderPush(orderId: string, orderNumber: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!supabaseUrl || !serviceRoleKey || !publicKey || !privateKey || !subject) {
    console.warn("Staff push is not configured; the order was created without a push notification.");
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error: claimError } = await admin
    .from("staff_push_deliveries")
    .insert({ order_id: orderId });

  if (claimError) {
    if (claimError.code === "23505") return;
    throw claimError;
  }

  const { data: subscriptions, error: subscriptionsError } = await admin
    .from("staff_push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (subscriptionsError) throw subscriptionsError;
  if (!subscriptions?.length) return;

  const vapid = { publicKey, privateKey, subject };
  const notification = JSON.stringify({
    title: "طلب جديد في لافازا",
    body: "وصل طلب جديد رقم #" + orderNumber + ". افتح لوحة الطلبات لمراجعته.",
    url: "/orders",
    tag: "lavaza-order-" + orderId,
  });

  await Promise.all(
    (subscriptions as StoredSubscription[]).map(async (subscription) => {
      try {
        await sendWebPush(subscription, notification, vapid);
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin
            .from("staff_push_subscriptions")
            .delete()
            .eq("id", subscription.id);
          return;
        }

        console.error("Push delivery failed for subscription:", subscription.id, error);
      }
    }),
  );
}
