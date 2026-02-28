export const Loading = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-green-600 animate-spin">refresh</span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">refresh</span>
    </div>
  );
};
