"use client";

import { useState } from "react";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";


export default function AuthPage(){

const router = useRouter();


const [name,setName] = useState("");
const [phone,setPhone] = useState("");
const [password,setPassword] = useState("");

const [avatar,setAvatar] = useState<File | null>(null);

const [loading,setLoading] = useState(false);

const [preview,setPreview] = useState("");



function handleImage(e: React.ChangeEvent<HTMLInputElement>){

const file = e.target.files?.[0];

if(file){

setAvatar(file);
setPreview(URL.createObjectURL(file));

}

}




async function handleRegister(){

if(!avatar || !name || !phone || !password){

alert("أكمل جميع البيانات");
return;

}


setLoading(true);



const fakeEmail = `user_${phone}@lavaza.app`;


const {data:existingUser}=await supabase
.from("profiles")
.select("id")
.eq("phone", phone)
.single();


if(existingUser){

alert("رقم الهاتف مستخدم مسبقاً");
setLoading(false);
return;

}
// إنشاء الحساب

const {data,error}=await supabase.auth.signUp({

email:fakeEmail,

password,

options:{

data:{
full_name:name,
phone:phone
}

}

});



if(error){

console.log(error);
alert(error.message);
setLoading(false);
return;

}



const user=data.user;



if(!user){

setLoading(false);
return;

}



// رفع الصورة الشخصية


const fileName = `${user.id}.jpg`;


const {error:uploadError}=await supabase
.storage
.from("avatars")
.upload(
fileName,
avatar,
{
upsert:true
}
);



if(uploadError){

console.log(uploadError);
alert(uploadError.message);

setLoading(false);
return;

}




const {
data:urlData
}=supabase
.storage
.from("avatars")
.getPublicUrl(fileName);



const avatarUrl=urlData.publicUrl;




// تحديث البروفايل


const {error:profileError}=await supabase

.from("profiles")

.update({

avatar_url:avatarUrl

})

.eq(
"id",
user.id
);



if(profileError){

console.log(profileError);

}




router.push("/create-post");

setLoading(false);


}





return (

<main className="
min-h-screen
bg-[#0b1428]
flex
items-center
justify-center
px-5
py-10
text-white
">


<div className="
w-full
max-w-md
bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-3xl
p-6
shadow-2xl
">


<div className="text-center mb-8">

<img
src="/menu/logo.png"
alt="Lavaza"
className="
w-20
mx-auto
mb-4
"
/>


<h1 className="
text-2xl
font-bold
">

انضم إلى Lavaza Mood ☕

</h1>


<p className="
text-white/60
text-sm
mt-2
">

اصنع حسابك وشارك لحظاتك

</p>

</div>




<label className="
cursor-pointer
flex
justify-center
mb-6
">


<div className="
w-28
h-28
rounded-full
overflow-hidden
border-2
border-[#d4af37]
bg-white/10
flex
items-center
justify-center
">

{

preview ?

<img
src={preview}
className="
w-full
h-full
object-cover
"
/>

:

<span className="text-4xl">
📷
</span>

}


</div>



<input

type="file"

accept="image/*"

onChange={handleImage}

className="hidden"

/>


</label>



<p className="
text-center
text-xs
text-white/50
mb-6
">

اختر صورتك الشخصية

</p>





<input

placeholder="الاسم الكامل"

value={name}

onChange={(e)=>setName(e.target.value)}

className="
w-full
mb-4
p-4
rounded-2xl
bg-white/10
border
border-white/10
outline-none
focus:border-[#d4af37]
"

/>





<input

placeholder="رقم الهاتف"

value={phone}

onChange={(e)=>setPhone(e.target.value)}

className="
w-full
mb-4
p-4
rounded-2xl
bg-white/10
border
border-white/10
outline-none
focus:border-[#d4af37]
"

/>





<input

placeholder="كلمة المرور"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

className="
w-full
mb-6
p-4
rounded-2xl
bg-white/10
border
border-white/10
outline-none
focus:border-[#d4af37]
"

/>






<button

onClick={handleRegister}

disabled={loading}

className="
w-full
bg-[#d4af37]
text-[#16284a]
py-4
rounded-full
font-bold
text-lg
active:scale-95
transition
"

>

{

loading
?
"جاري إنشاء الحساب..."
:
"إنشاء حساب"

}


</button>



<div className="
text-center
mt-6
text-sm
text-white/70
">

لديك حساب بالفعل؟

<a
href="/login"
className="
text-[#d4af37]
font-bold
mr-2
"
>

تسجيل الدخول

</a>


</div>



</div>


</main>

);
}