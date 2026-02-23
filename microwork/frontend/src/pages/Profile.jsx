import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { fetchProfileFromIPFS, updateProfileToIPFS } from '../utils/ipfs';

function Profile() {
    const { address, isConnected } = useAccount();

    // State
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [avatar, setAvatar] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Initial load
    useEffect(() => {
        if (!address) return;
        setIsLoading(true);
        fetchProfileFromIPFS(address).then(data => {
            setName(data.name || '');
            setBio(data.bio || '');
            setSkills(data.skills?.join(', ') || '');
            setAvatar(data.avatar || '');
            setIsLoading(false);
        });
    }, [address]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Name cannot be empty.');
            return;
        }

        setIsSaving(true);
        toast.loading('Saving to IPFS...', { id: 'saveProfile' });

        try {
            const formattedSkills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
            const newProfile = {
                name: name.trim(),
                bio: bio.trim(),
                skills: formattedSkills,
                avatar: avatar,
            };

            await updateProfileToIPFS(address, newProfile);
            toast.success('Profile saved to IPFS successfully!', { id: 'saveProfile' });
        } catch (err) {
            toast.error('Failed to save profile', { id: 'saveProfile' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="animate-fade-in pt-8 text-center">
                <h1 className="font-antigravity text-3xl text-tx-primary mb-3">Profile</h1>
                <p className="text-tx-secondary">Connect your wallet to setup your worker profile.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="animate-fade-in pt-8 text-center">
                <p className="text-tx-secondary">Loading profile data from IPFS...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="pt-2">
                <h1 className="font-antigravity text-3xl md:text-4xl text-tx-primary">
                    Edit Profile
                </h1>
                <p className="text-tx-secondary text-sm mt-1">
                    Your reputation metadata stored on IPFS.
                </p>
            </div>

            <form onSubmit={handleSave} className="card p-6 md:p-8 space-y-6">

                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="Avatar preview"
                            className="w-16 h-16 rounded-full border border-border bg-white"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center text-xl">
                            🧑‍🔧
                        </div>
                    )}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-tx-secondary mb-1">
                            Avatar URL
                        </label>
                        <input
                            type="text"
                            placeholder="https://..."
                            className="input-field"
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-tx-secondary mb-2">
                        Display Name
                    </label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSaving}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-tx-secondary mb-2">
                        Skills (comma separated)
                    </label>
                    <input
                        type="text"
                        placeholder="Plumber, Electrician, Developer..."
                        className="input-field"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        disabled={isSaving}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-tx-secondary mb-2">
                        Bio / Description
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="Tell clients about yourself..."
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={isSaving}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="btn-primary w-full"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Uploading to IPFS...' : 'Save Profile Changes'}
                    </button>
                    <p className="text-xs text-tx-tertiary text-center mt-3">
                        Profiles are public and securely referenced via Web3.Storage.
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Profile;
