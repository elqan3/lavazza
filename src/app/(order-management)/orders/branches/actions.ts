"use server";

import { createClient } from "@/services/supabase/server";

export type ManagedBranch = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
};

export async function loadManagedBranches(): Promise<ManagedBranch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_management_branches");

  if (error) {
    console.error("Load managed branches error:", error);
    throw new Error(error.message || "تعذر تحميل الفروع.");
  }

  return (data ?? []) as ManagedBranch[];
}

export async function setBranchActive(branchId: string, isActive: boolean) {
  if (!branchId) throw new Error("معرّف الفرع مطلوب.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_order_branch_active", {
    p_branch_id: branchId,
    p_is_active: isActive,
  });

  if (error) {
    console.error("Set branch active error:", error);
    throw new Error(error.message || "تعذر تحديث حالة الفرع.");
  }

  return true;
}
