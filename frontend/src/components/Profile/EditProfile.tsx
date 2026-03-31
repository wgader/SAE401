import { useState, useRef } from 'react';
import { api, BASE_URL } from '../../lib/api';
import type { User } from '../../lib/api';
import { FiX, FiCamera } from 'react-icons/fi';
import { Toast } from '../ui/Toast';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

interface EditProfileProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export default function EditProfile({ user, onClose, onUpdate }: EditProfileProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [focus, setFocus] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar ? `${AVATAR_BASE_URL}${user.avatar}` : `${AVATAR_BASE_URL}default.png`);
  const [bannerPreview, setBannerPreview] = useState<string>(
    user.banner && user.banner !== 'default_banniere.png'
      ? `${BASE_URL}/uploads/banners/${user.banner}`
      : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('website', website);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const updatedUser = await api.updateProfile(formData);
      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Une erreur inconnue est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      <dialog open className="relative w-full h-full sm:h-auto sm:max-w-xl bg-background sm:border sm:border-border sm:rounded-2xl shadow-2xl flex flex-col sm:max-h-[min(90vh,45rem)] overflow-hidden m-0 p-0 text-text-primary">
        <form onSubmit={handleSubmit} className="flex flex-col h-[100dvh] sm:h-full overflow-hidden w-full">

          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
            <nav className="flex items-center gap-4 m-0 p-0 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                aria-label="Fermer"
              >
                <FiX className="w-5 h-5 text-text-primary" />
              </button>
              <h1 className="text-xl font-bold m-0 whitespace-nowrap truncate shrink min-w-0">Éditer le profil</h1>
            </nav>
            <button
              type="submit"
              disabled={isSaving || !name.trim() || bio.length > 160 || name.length > 50 || location.length > 30 || website.length > 100}
              className="bg-[image:var(--color-linear-gradient)] text-black font-bold font-druk uppercase px-4 py-1.5 rounded-full hover:opacity-90 transition disabled:opacity-50 text-sm shadow-[0_4px_14px_0_rgba(166,253,122,0.39)] shrink-0"
            >
              ENREGISTRER
            </button>
          </header>

          <section className="overflow-y-auto w-full flex-1 pb-32 sm:pb-10">
            {error ? <p className="p-3 bg-red-500/10 text-red-500 text-sm font-semibold m-0">{error}</p> : null}

            <figure className="relative h-48 w-full bg-surface-hover flex items-center justify-center group overflow-hidden m-0">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Bannière" className="w-full h-full object-cover block" />
              ) : (
                <div className="w-full h-full bg-[image:var(--color-linear-gradient)] opacity-50" />
              )}
              <figcaption className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Modifier la bannière"
                >
                  <FiCamera className="w-5 h-5 text-white" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                />
              </figcaption>
            </figure>

            <figure className="px-4 relative mb-4 m-0">
              <picture className="relative -mt-12 w-28 h-28 rounded-full border-4 border-background bg-surface overflow-hidden group block">
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover block" />
                <figcaption className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="p-2.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Modifier la photo de profil"
                  >
                    <FiCamera className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                  />
                </figcaption>
              </picture>
            </figure>

            <fieldset className="px-4 flex flex-col gap-6 mt-4 border-none m-0 p-0">
              <label className="relative flex flex-col border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded pt-6 pb-2 px-2 transition-all">
                <header className="absolute top-2 left-2 right-2 flex justify-between px-1">
                  <p className={`text-xs transition-colors m-0 ${focus === 'name' ? 'text-primary' : 'text-text-secondary'}`}>Nom</p>
                  {focus === 'name' && <output className="text-xs text-text-secondary m-0">{name.length} / 50</output>}
                </header>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocus('name')}
                  onBlur={() => setFocus(null)}
                  className="bg-transparent text-text-primary px-1 outline-none font-medium text-[15px]"
                  maxLength={50}
                  required
                />
              </label>

              <label className="relative flex flex-col border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded pt-6 pb-2 px-2 transition-all">
                <header className="absolute top-2 left-2 right-2 flex justify-between px-1">
                  <p className={`text-xs transition-colors m-0 ${focus === 'bio' ? 'text-primary' : 'text-text-secondary'}`}>Bio</p>
                  {focus === 'bio' && <output className="text-xs text-text-secondary m-0">{bio.length} / 160</output>}
                </header>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onFocus={() => setFocus('bio')}
                  onBlur={() => setFocus(null)}
                  className="bg-transparent text-text-primary px-1 outline-none resize-none min-h-20 text-[15px]"
                  maxLength={160}
                />
              </label>

              <label className="relative flex flex-col border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded pt-6 pb-2 px-2 transition-all">
                <header className="absolute top-2 left-2 right-2 flex justify-between px-1">
                  <p className={`text-xs transition-colors m-0 ${focus === 'location' ? 'text-primary' : 'text-text-secondary'}`}>Localisation</p>
                  {focus === 'location' && <output className="text-xs text-text-secondary m-0">{location.length} / 30</output>}
                </header>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setFocus('location')}
                  onBlur={() => setFocus(null)}
                  className="bg-transparent text-text-primary px-1 outline-none text-[15px]"
                  maxLength={30}
                />
              </label>

              <label className="relative flex flex-col border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded pt-6 pb-2 px-2 transition-all">
                <header className="absolute top-2 left-2 right-2 flex justify-between px-1">
                  <p className={`text-xs transition-colors m-0 ${focus === 'website' ? 'text-primary' : 'text-text-secondary'}`}>Site web</p>
                  {focus === 'website' && <output className="text-xs text-text-secondary m-0">{website.length} / 100</output>}
                </header>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  onFocus={() => setFocus('website')}
                  onBlur={() => setFocus(null)}
                  className="bg-transparent text-text-primary px-1 outline-none text-[15px]"
                  maxLength={100}
                />
              </label>
            </fieldset>
          </section>
        </form>
      </dialog>
      {error && (
        <Toast 
          isVisible={!!error} 
          message={error} 
          onClose={() => setError(null)} 
          type="error"
        />
      )}
    </div>
  );
}
