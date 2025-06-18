export default function ProfileCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <img
        src="/profile.jpg" // Make sure this image exists in your public folder
        alt="Agnives Profile"
        className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-4"
      />
      <h1 className="text-4xl font-bold">I Am Awesome</h1>
      <p className="text-lg mt-2">By Agnives ✨</p>
    </div>
  );
}
