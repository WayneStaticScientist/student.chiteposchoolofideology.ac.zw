import { RegisterForm } from "../../../components/RegisterForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ nationalId: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-primary -z-10 rounded-b-[40%]" />
      <RegisterForm nationalId={resolvedParams.nationalId} />
    </div>
  );
}
