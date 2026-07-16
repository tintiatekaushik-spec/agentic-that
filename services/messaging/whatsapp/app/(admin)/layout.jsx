import { requireUser } from "@/lib/auth";
import { getBusiness } from "@/lib/data";
import Nav from "@/components/Nav";

export default async function AdminLayout({ children }) {
  const user = await requireUser();
  const business = await getBusiness(user.business_id);

  return (
    <div className="mx-auto min-h-screen max-w-3xl">
      <Nav businessName={business?.name} />
      <main className="px-4 pb-24 pt-4 sm:pb-8">{children}</main>
    </div>
  );
}
