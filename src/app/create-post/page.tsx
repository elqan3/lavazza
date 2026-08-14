"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
import { ImagePlus, Coffee } from "lucide-react";

export default function CreatePost() {

  const router = useRouter();

  const [image,setImage] = useState<File | null>(null);
  const [preview,setPreview] = useState("");
  const [content,setContent] = useState("");
  const [loading,setLoading] = useState(false);


  function handleImage(e: React.ChangeEvent<HTMLInputElement>){

    const file = e.target.files?.[0];

    if(file){

      setImage(file);
      setPreview(URL.createObjectURL(file));

    }

  }


async function publishPost(){

if(!image || !content){

alert("أضف صورة ووصف");
return;

}


setLoading(true);


const {
data:{user}
}=await supabase.auth.getUser();



if(!user){

router.push("/auth");
return;

}



const fileName =
`${user.id}-${Date.now()}.jpg`;



const {error:uploadError}=await supabase.storage
.from("mood-images")
.upload(
fileName,
image
);



if(uploadError){

alert(uploadError.message);
setLoading(false);
return;

}



const {
data:urlData
}=supabase.storage
.from("mood-images")
.getPublicUrl(fileName);



const {error:postError}=await supabase
.from("posts")
.insert({

user_id:user.id,
image_url:urlData.publicUrl,
content

});



if(postError){

alert(postError.message);
setLoading(false);
return;

}



router.push("/mood-space");

}



return (

<main className="
min-h-screen
bg-[#0b1428]
text-white
px-5
py-8
">


<header className="
flex
items-center
justify-center
mb-8
">

<h1 className="
text-xl
font-bold
">

شارك لحظتك ☕

</h1>

</header>



<div className="
max-w-md
mx-auto
space-y-6
">



<label className="
block
cursor-pointer
">


<div className="
relative
aspect-square
rounded-3xl
overflow-hidden
border
border-white/10
bg-[#16284a]
flex
items-center
justify-center
shadow-xl
">


{
preview ?

<Image
src={preview}
alt=""
fill
sizes="(max-width: 768px) 100vw, 500px"
className="
object-cover
"
/>

:

<div className="
text-center
text-white/60
">

<ImagePlus
size={45}
className="mx-auto mb-3 text-[#d4af37]"
/>

<p>
أضف صورة اللحظة
</p>

</div>

}


</div>


<input

type="file"

accept="image/*"

onChange={handleImage}

className="hidden"

/>


</label>




<textarea

value={content}

onChange={(e)=>setContent(e.target.value)}

placeholder="اكتب وصف اللحظة..."

className="
w-full
h-36
rounded-3xl
bg-white/10
border
border-white/10
p-5
text-white
placeholder:text-white/40
outline-none
resize-none
focus:border-[#d4af37]
"

/>





<button

onClick={publishPost}

disabled={loading}

className="
w-full
py-4
rounded-full
bg-[#d4af37]
text-[#16284a]
font-bold
text-lg
flex
items-center
justify-center
gap-2
active:scale-95
transition
"

>

<Coffee size={22}/>

{
loading
?
"جاري النشر..."
:
"نشر اللحظة"
}


</button>



</div>


</main>

)

}