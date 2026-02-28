import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 px-6 lg:px-20 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <span className="material-symbols-outlined text-3xl">directions_bike</span>
            <h3 className="text-xl font-bold">CycleTrust</h3>
          </div>
          <p className="text-slate-400 text-sm">
            Thị trường xe đạp thể thao đã qua sử dụng đáng tin cậy nhất Việt Nam.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Mua xe</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="#" className="hover:text-green-600">Road Bikes</Link></li>
            <li><Link to="#" className="hover:text-green-600">MTB</Link></li>
            <li><Link to="#" className="hover:text-green-600">Gravel Bikes</Link></li>
            <li><Link to="#" className="hover:text-green-600">Xe đã xác thực</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="#" className="hover:text-green-600">Hướng dẫn mua bán</Link></li>
            <li><Link to="#" className="hover:text-green-600">Chính sách bảo mật</Link></li>
            <li><Link to="#" className="hover:text-green-600">Điều khoản sử dụng</Link></li>
            <li><Link to="#" className="hover:text-green-600">Liên hệ</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Kết nối</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 transition-colors">
              <span className="material-symbols-outlined">facebook</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 transition-colors">
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
        © 2026 CycleTrust. All rights reserved.
      </div>
    </footer>
  );
};
