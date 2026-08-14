"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Camera,
  Loader2,
  Save,
  UserRound
} from "lucide-react";

import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/services/supabase/client";


export default function EditProfilePage() {

  const router = useRouter();
  const params = useParams();

  const profileId = params.id as string;


  const [userId, setUserId] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



  useEffect(() => {

    loadProfile();

  }, []);



  async function loadProfile() {

    const {
      data:{user}
    } = await supabase.auth.getUser();


    if(!user){

      router.push("/login");
      return;

    }



    // حماية الحساب
    if(user.id !== profileId){

      router.push(`/profile/${user.id}`);
      return;

    }



    setUserId(user.id);



    const {
      data,
      error
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id",user.id)
      .single();



    if(error || !data){

      alert("تعذر تحميل الحساب");
      router.back();
      return;

    }



    setName(data.full_name || "");
    setUsername(data.username || "");
    setPhone(data.phone || "");
    setAvatar(data.avatar_url || "");
    setBio(data.bio || "");


    setLoading(false);

  }




  function handleAvatarChange(
    e:React.ChangeEvent<HTMLInputElement>
  ){

    const file=e.target.files?.[0];


    if(!file) return;



    if(!file.type.startsWith("image/")){

      alert("اختر صورة فقط");
      return;

    }



    if(file.size > 5 * 1024 * 1024){

      alert("حجم الصورة أكبر من 5MB");
      return;

    }



    setAvatarFile(file);


    const url =
      URL.createObjectURL(file);


    setPreview(url);


  }





  async function saveProfile(){


    if(!name.trim()){

      alert("اكتب الاسم");
      return;

    }


    setSaving(true);



    let avatarUrl = avatar;



    if(avatarFile){


      const path =
      `${userId}.jpg`;



      const {
        error
      } = await supabase.storage
      .from("avatars")
      .upload(
        path,
        avatarFile,
        {
          upsert:true,
          cacheControl:"0"
        }
      );



      if(error){

        alert(error.message);
        setSaving(false);
        return;

      }



      const {
        data
      } =
      supabase.storage
      .from("avatars")
      .getPublicUrl(path);



      avatarUrl =
      `${data.publicUrl}?t=${Date.now()}`;


    }




    const {
      error
    } =
    await supabase
    .from("profiles")
    .update({

      full_name:name.trim(),

      username:
      username
      .trim()
      .toLowerCase(),

      bio:
      bio.trim(),

      avatar_url:
      avatarUrl || null

    })
    .eq(
      "id",
      userId
    );



    if(error){

      alert(error.message);
      setSaving(false);
      return;

    }



    router.push(
      `/profile/${userId}`
    );

    router.refresh();

  }





  if(loading){

    return (

      <main className="
      min-h-screen
      bg-[#1a2a4a]
      flex
      items-center
      justify-center
      text-white
      ">

        <Loader2
        className="animate-spin text-[#d4af37]"
        size={35}
        />

      </main>

    );

  }




  return (

    <main
    className="
    min-h-screen
    bg-gradient-to-b
    from-[#1a2a4a]
    to-[#081222]
    px-4
    py-6
    text-white
    "
    >


      <div
      className="
      mx-auto
      max-w-md
      "
      >



      <div
      className="
      flex
      items-center
      justify-between
      mb-8
      "
      >


        <button
        onClick={()=>router.back()}
        className="
        rounded-full
        bg-white/10
        p-3
        "
        >

          <ArrowRight size={20}/>

        </button>



        <h1 className="
        text-xl
        font-bold
        ">

          تعديل الحساب

        </h1>


        <div className="w-10"/>


      </div>





      <div
      className="
      rounded-[2rem]
      bg-[#16284a]
      border
      border-white/10
      p-6
      shadow-2xl
      "
      >




      <div className="
      flex
      justify-center
      "
      >

      <label
      className="
      relative
      cursor-pointer
      "
      >


      <Image

      src={
        preview ||
        avatar ||
        "/avatar.png"
      }

      alt="avatar"

      width={120}
      height={120}

      className="
      rounded-full
      border-4
      border-[#d4af37]
      object-cover
      "
      />



      <div
      className="
      absolute
      bottom-1
      right-1
      bg-[#d4af37]
      text-[#16284a]
      rounded-full
      p-2
      "
      >

        <Camera size={18}/>

      </div>



      <input
      hidden
      type="file"
      accept="image/*"
      onChange={handleAvatarChange}
      />


      </label>


      </div>






      <div className="mt-7">


      <label>
      الاسم
      </label>


      <input

      value={name}

      onChange={
        e=>setName(e.target.value)
      }

      className="
      mt-2
      w-full
      rounded-2xl
      bg-white/10
      p-4
      outline-none
      "
      />

      </div>





      <div className="mt-5">

      <label>
      اسم المستخدم
      </label>


      <input

      value={username}

      onChange={
      e=>setUsername(e.target.value)
      }

      className="
      mt-2
      w-full
      rounded-2xl
      bg-white/10
      p-4
      outline-none
      "

      />

      </div>






      <div className="mt-5">

      <label>
      نبذة
      </label>


      <textarea

      value={bio}

      onChange={
      e=>setBio(e.target.value)
      }

      className="
      mt-2
      h-28
      w-full
      resize-none
      rounded-2xl
      bg-white/10
      p-4
      outline-none
      "

      />


      </div>






      <div className="mt-5">


      <label>
      الهاتف
      </label>


      <input

      value={phone}

      disabled

      className="
      mt-2
      w-full
      rounded-2xl
      bg-black/20
      p-4
      text-white/40
      "

      />


      </div>






      <button

      onClick={saveProfile}

      disabled={saving}

      className="
      mt-8
      flex
      w-full
      justify-center
      items-center
      gap-2
      rounded-full
      bg-[#d4af37]
      py-4
      font-bold
      text-[#16284a]
      "

      >

      {
      saving
      ?
      <>
      <Loader2
      className="animate-spin"
      size={20}
      />
      جاري الحفظ
      </>
      :
      <>
      <Save size={20}/>
      حفظ التغييرات
      </>
      }


      </button>




      </div>


      </div>


    </main>

  );

}