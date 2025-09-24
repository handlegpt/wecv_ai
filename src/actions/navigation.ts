"use server";

import { redirect } from "next/navigation";

export async function GoDashboardAction() {
  redirect("/dashboard");
}
export async function GoResumesAction() {
  redirect("/dashboard/resumes");
}
export async function GoTemplatesAction() {
  redirect("/dashboard/templates");
}
