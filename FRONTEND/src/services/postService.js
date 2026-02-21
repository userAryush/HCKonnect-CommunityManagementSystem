import apiClient from './apiClient';

const postService = {
    // Get list of posts
    getPosts: async (page = 1, userId = null) => {
        try {
            let url = `/contents/post-list/?page=${page}`;
            if (userId) {
                url += `&user_id=${userId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single post detail
    getPost: async (id) => {
        try {
            const response = await apiClient.get(`/contents/post/detail/${id}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create a new post
    createPost: async (data) => {
        try {
            // Use FormData if there's an image
            const response = await apiClient.post('/contents/post/create/', data, {
                headers: {
                    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a post
    updatePost: async (id, data) => {
        try {
            const response = await apiClient.patch(`/contents/post/${id}/manage/`, data, {
                headers: {
                    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a post
    deletePost: async (id) => {
        try {
            const response = await apiClient.delete(`/contents/post/${id}/manage/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create a comment/reply
    createComment: async (data) => {
        try {
            const response = await apiClient.post('/contents/post/comments/create/', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get paginated comments for a post
    getComments: async (postId, page = 1) => {
        try {
            const response = await apiClient.get(`/contents/post/comments/list/?post_id=${postId}&page=${page}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a comment
    updateComment: async (id, data) => {
        try {
            const response = await apiClient.patch(`/contents/post/comments/${id}/update/`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a comment
    deleteComment: async (id) => {
        try {
            const response = await apiClient.delete(`/contents/post/comments/${id}/delete/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Toggle reaction
    toggleReaction: async (data) => {
        try {
            const response = await apiClient.post('/contents/post/react/', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default postService;
