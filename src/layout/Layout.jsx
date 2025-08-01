export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 px-4">
      <div className="w-[80%] mx-auto bg-white rounded-2xl shadow-xl p-10 space-y-10 border border-gray-100">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-teal-800 tracking-tight drop-shadow-sm">
            Algoritmo WFA
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Visualización interactiva del alineamiento Wavefront
          </p>
        </header>

        <div className="space-y-10">{children}</div>
      </div>
    </div>
  );
}
