import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 selection:bg-accent selection:text-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
