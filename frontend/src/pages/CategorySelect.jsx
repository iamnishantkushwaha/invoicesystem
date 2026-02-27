import { useNavigate } from 'react-router-dom';
import { Sparkles, Coins, Layers, ArrowLeft, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';


const CategorySelect = () => {
    const navigate = useNavigate();
    const selectedFirm = JSON.parse(localStorage.getItem('selectedFirm') || '{}');

    const categories = [
        {
            id: 'gold',
            title: 'Gold',
            description: 'Pure gold ornaments & items.',
            icon: <Sparkles className="w-8 h-8" />,
        },
        {
            id: 'silver',
            title: 'Silver',
            description: 'Silver articles & jewelry.',
            icon: <Coins className="w-8 h-8" />,
        },
        {
            id: 'both',
            title: 'Both',
            description: 'Gold & silver mixed invoice.',
            icon: <Layers className="w-8 h-8" />,
        }
    ];

    const handleSelect = (category) => {
        localStorage.setItem('selectedCategory', category);
        navigate('/type');
    };

    return (
        <div className="page-container">
            <div className="content-max-width">
                <div className="flex justify-between items-center mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Units
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate('/');
                            toast.info('Logged out successfully');
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all border border-white/10"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mb-16">
                    <p className="text-teal-500 font-bold tracking-widest text-[10px] uppercase mb-4">
                        Current Firm: {selectedFirm.name}
                    </p>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Asset <span className="text-teal-400">Category</span>
                    </h1>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Select the primary classification for this transaction record.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, index) => (
                        <button
                            key={cat.id}
                            onClick={() => handleSelect(cat.id)}
                            className="card-modern flex flex-col items-center text-center group animate-fade-in"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-all uppercase">
                                {cat.title}
                            </h3>
                            <p className="text-gray-500 text-xs">
                                {cat.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategorySelect;
