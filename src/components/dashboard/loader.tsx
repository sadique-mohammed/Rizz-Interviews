import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader strokeWidth={2} className="h-6 w-6 animate-spin" />
    </div>
  );
};

export default Loading;
