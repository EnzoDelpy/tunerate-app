import { Outlet } from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Header />
      <main className="flex-grow mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
