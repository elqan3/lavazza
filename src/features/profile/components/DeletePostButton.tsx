"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";


type Props = {
  postId: string;
  imageUrl?: string;
};


export default function DeletePostButton({
  postId,
  imageUrl,
}: Props) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);


  async function deletePost() {

    const confirmDelete = confirm(
      "هل تريد حذف هذا المنشور؟"
    );

    if (!confirmDelete) return;


    setLoading(true);


    // حذف الصورة من Storage
    if (imageUrl) {

      const fileName = imageUrl
        .split("/mood-images/")
        .pop();


      if (fileName) {

        await supabase.storage
          .from("mood-images")
          .remove([
            fileName
          ]);

      }
    }


    // حذف المنشور
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);



    if(error){

      alert(error.message);
      setLoading(false);
      return;

    }


    router.refresh();

  }


  return (

    <button
      onClick={deletePost}
      disabled={loading}
      className="
        flex
        items-center
        gap-2
        text-red-400
        text-xs
        disabled:opacity-50
      "
    >

      <Trash2 size={16}/>

      {
        loading
        ?
        "جاري الحذف..."
        :
        "حذف"
      }

    </button>

  );
}