import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryIcon } from '../../lib/icons';

export default function CategoryGrid({ categories = [] }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
      {categories.map((cat, i) => {
        const Icon = categoryIcon(cat.icon);
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
          >
            <Link
              to={`/search?categoryId=${cat.id}`}
              className="group flex h-full flex-col items-center gap-2.5 rounded-2xl border border-line bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-gradient group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-xs font-semibold leading-tight text-ink">{cat.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
