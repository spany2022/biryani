import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import AdminApp from "@/components/admin/AdminApp";
import AdminLogin from "@/components/admin/AdminLogin";
import { adminEnabled, isAdmin } from "@/lib/auth";
import { getEnquiries, getMenu, getOrders } from "@/lib/store";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function listImages() {
  try {
    const files = await fs.readdir(path.join(process.cwd(), "public", "images"));
    return files.filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).map((f) => `/images/${f}`).sort();
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  let content: React.ReactNode;
  if (!adminEnabled()) {
    content = (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="font-serif text-5xl">Admin is disabled</h1>
        <p className="mt-4 text-ink/70">
          Set <code className="rounded bg-ink/10 px-1.5 py-0.5">ADMIN_PASSWORD</code> in the server environment (see{" "}
          <code className="rounded bg-ink/10 px-1.5 py-0.5">.env.example</code>) and restart to enable it.
        </p>
      </div>
    );
  } else if (!(await isAdmin())) {
    content = <AdminLogin />;
  } else {
    const [menu, orders, enquiries, images] = await Promise.all([getMenu(), getOrders(), getEnquiries(), listImages()]);
    content = <AdminApp initial={{ menu, orders, enquiries }} images={images} />;
  }

  return (
    <main id="main" tabIndex={-1} className="on-light min-h-screen bg-cream px-5 pb-24 pt-28 text-ink md:px-10">
      {content}
    </main>
  );
}
