import { StatusForm } from "../../components/StatusForm";

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-primary -z-10 rounded-b-[40%]" />
      <StatusForm />
    </div>
  );
}
