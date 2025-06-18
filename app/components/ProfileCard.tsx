export default function image1() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <img
        src="/profile.jpg" // or use the placeholder: "https://i.imgur.com/27bzi5y_d.webp?maxwidth=520&shape=thumb&fidelity=high"
        alt="Your Image"
        className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-4"
      />
      <h1 className="text-4xl font-bold">I Am Awesome</h1>
      <p className="text-lg mt-2">By Agnives ✨</p>
    </div>
  )
}