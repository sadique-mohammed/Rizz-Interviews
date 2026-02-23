import Loader from '@/components/dashboard/loader';

export default function Loading() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white'>
      <Loader />
    </div>
  );
}
