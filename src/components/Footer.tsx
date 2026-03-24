export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="text-xs text-charcoal/50">
              岸和田市職員労働組合
            </span>
          </div>
          <p className="text-xs text-charcoal/40">
            組合員手帳別冊デジタル版
          </p>
        </div>
      </div>
    </footer>
  );
}
