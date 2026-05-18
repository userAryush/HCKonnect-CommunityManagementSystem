import { useEffect, useState } from 'react';
import ModalWrapper from '../../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../../shared/components/modals/ModalHeader';
import Button from '../../../../shared/components/ui/Button';
import apiClient from '../../../../shared/services/apiClient';
import { useToast } from '../../../../shared/components/ui/ToastContext';

const initialForm = {
  username: '',
  email: '',
  role: '',
  course: '',
  bio: '',
  linkedin_link: '',
  github_link: '',
  interests: '',
  university_id: '',
  first_name: '',
  last_name: '',
  community_name: '',
  community_description: '',
  community_tag: ''
};

export default function EditProfileModal({ isOpen, onClose, profileId, onSaved }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(null);
  const [communityLogo, setCommunityLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const endpoint = profileId ? `/accounts/profile/${profileId}/` : '/accounts/profile/';
        const res = await apiClient.get(endpoint);
        const data = res.data;
        setFormData({
          username: data.username || '',
          email: data.email || '',
          role: data.role || '',
          course: data.course || '',
          bio: data.bio || '',
          linkedin_link: data.linkedin_link || '',
          github_link: data.github_link || '',
          university_id: data.university_id || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          community_name: data.community_name || '',
          community_description: data.community_description || '',
          community_tag: data.community_tag || '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || '')
        });
        setPreviewUrl(data.role === 'community' ? (data.community_logo || '') : (data.profile_image || ''));
      } catch (error) {
        console.error('Failed to load profile', error);
        showToast('Failed to load profile data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isOpen, profileId, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formData.role === 'community') {
      setCommunityLogo(file);
    } else {
      setProfileImage(file);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      if (formData.role === 'community') {
        data.append('community_name', formData.community_name);
        data.append('community_description', formData.community_description);
        data.append('community_tag', formData.community_tag);
        if (communityLogo) data.append('community_logo', communityLogo);
      } else {
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('course', formData.course);
        data.append('university_id', formData.university_id);
        if (profileImage) data.append('profile_image', profileImage);
      }

      data.append('bio', formData.bio);
      if (formData.linkedin_link) data.append('linkedin_link', formData.linkedin_link);
      if (formData.github_link) data.append('github_link', formData.github_link);
      data.append('interests', JSON.stringify(formData.interests.split(',').map((s) => s.trim()).filter(Boolean)));

      const endpoint = profileId ? `/accounts/profile/${profileId}/` : '/accounts/profile/';
      const response = await apiClient.patch(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Profile updated successfully!', 'success');
      if (onSaved) onSaved(response.data);
      onClose();
    } catch (error) {
      console.error('Update failed', error.response?.data || error);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-6xl">
      <ModalHeader
        title={formData.role === 'community' ? 'Edit Community Profile' : 'Edit Profile'}
        subtitle="Update your profile information."
        onClose={onClose}
      />
      <div className="p-8">
        {loading ? (
          <div className="h-36 rounded-xl bg-zinc-100 animate-pulse" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-surface-border bg-zinc-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <label className="cursor-pointer rounded-xl border border-surface-border px-4 py-2 text-sm font-semibold hover:bg-zinc-50">
                {formData.role === 'community' ? 'Change Logo' : 'Change Photo'}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>

            {formData.role === 'community' ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-bold text-surface-dark">Community Name</label>
                  <input name="community_name" value={formData.community_name} onChange={handleChange} placeholder="Community Name" className="w-full input-standard" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-surface-dark">Community Tagline</label>
                  <input name="community_tag" value={formData.community_tag} onChange={handleChange} placeholder="Community Tagline" className="w-full input-standard" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-surface-dark">Community Description</label>
                  <textarea name="community_description" value={formData.community_description} onChange={handleChange} rows={4} placeholder="Community Description" className="w-full input-standard resize-none" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-surface-dark">First Name</label>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" className="w-full input-standard" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-surface-dark">Last Name</label>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="w-full input-standard" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-surface-dark">Course</label>
                    <input name="course" value={formData.course} onChange={handleChange} placeholder="Course" className="w-full input-standard" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-surface-dark">University ID</label>
                    <input name="university_id" value={formData.university_id} onChange={handleChange} placeholder="University ID" className="w-full input-standard" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-surface-dark">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Bio" className="w-full input-standard resize-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-surface-dark">Interests</label>
              <input name="interests" value={formData.interests} onChange={handleChange} placeholder="Interests (comma separated)" className="w-full input-standard" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-surface-dark">LinkedIn URL</label>
                <input name="linkedin_link" value={formData.linkedin_link} onChange={handleChange} placeholder="LinkedIn URL" className="w-full input-standard" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-surface-dark">GitHub URL</label>
                <input name="github_link" value={formData.github_link} onChange={handleChange} placeholder="GitHub URL" className="w-full input-standard" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={submitLoading} loadingText="Saving...">Save Changes</Button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
