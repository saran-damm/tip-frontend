import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <Navbar>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-extrabold text-slate-800 mb-6">
            Welcome to <span className="relative inline-block group">
              <span className="font-extrabold tracking-tight text-slate-800">TIP</span>
              <span className="text-[#48B3AF] font-normal relative">
                <span className="relative">.</span>
                <span className="font-medium">ai</span>
              </span>
            </span>
          </h1>
          <p className="text-xl text-slate-600">
            Your intelligent strategy assistant. Use the sidebar to navigate through the application.
          </p>
        </div>
      </div>
    </Navbar>
  );
}
