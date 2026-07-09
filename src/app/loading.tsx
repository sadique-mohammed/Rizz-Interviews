import { Loader } from 'lucide-react';

const Loading = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <Loader size={30} strokeWidth={2} className='animate-spin' />
    </div>
  );
};

export default Loading;
