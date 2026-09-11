const PAYMENT_PROOF_FUNCTION_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/payment-proof`;

type PreparePaymentProofResponse = {
  success: boolean;
  action?: "prepare";
  orderId?: string;
  storagePath?: string;
  token?: string;
  paymentDeadline?: string;
  error?: string;
};

export async function preparePaymentProofUpload(
  orderId: string,
  trackingToken: string,
): Promise<PreparePaymentProofResponse> {
  const response = await fetch(
    PAYMENT_PROOF_FUNCTION_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "prepare",
        orderId,
        trackingToken,
      }),
      cache: "no-store",
    },
  );

  const data =
    (await response.json()) as PreparePaymentProofResponse;

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "تعذر تجهيز رفع إثبات الدفع.",
    );
  }

  return data;
}
export async function uploadPaymentProof(
  storagePath: string,
  token: string,
  file: File,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/payment-proofs/${storagePath}?token=${encodeURIComponent(token)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Payment proof upload failed:",
      errorText,
    );

    throw new Error(
      "تعذر رفع صورة إثبات الدفع.",
    );
  }

  return {
    success: true,
    storagePath,
  };
}

type FinalizePaymentProofResponse = {
  success: boolean;
  action?: "finalize";
  proofId?: string;
  paymentId?: string;
  orderId?: string;
  paymentStatus?: string;
  error?: string;
};

export async function finalizePaymentProof(
  orderId: string,
  trackingToken: string,
  storagePath: string,
): Promise<FinalizePaymentProofResponse> {
  const response = await fetch(
    PAYMENT_PROOF_FUNCTION_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "finalize",
        orderId,
        trackingToken,
        storagePath,
      }),
      cache: "no-store",
    },
  );

  const data =
    (await response.json()) as FinalizePaymentProofResponse;

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "تعذر تسجيل إثبات الدفع.",
    );
  }

  return data;
}