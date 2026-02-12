import AdminLayout from "../components/AdminLayout";

export default function AdminSettings() {
  return (
    <AdminLayout
      title="Settings"
      subtitle="Keep everything tidy and secure for your team."
    >
      <div className="admin-card">
        <h3 className="admin-section-title">Admin settings</h3>
        <p className="admin-subtle">
          Settings will live here. For now, manage roles from the Students page.
        </p>
      </div>
    </AdminLayout>
  );
}
