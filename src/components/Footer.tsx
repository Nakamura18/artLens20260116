import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 py-8 border-t border-slate-800 text-center">
      <p className="font-serif-art text-sm text-slate-500 mb-1">
        Artistic Heartscape Museum
      </p>
      <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em]">
        &copy; {currentYear} 画家の心象風景を読み解く没入型デジタル・アーカイブ
      </p>
    </footer>
  );
};

export default Footer;
