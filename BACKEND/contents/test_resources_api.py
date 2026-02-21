from django.test import TestCase
from django.contrib.auth import get_user_model
from communities.models import CommunityMembership
from contents.models import Resource
from rest_framework.test import APIClient
import uuid

User = get_user_model()

class ResourceAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create community
        self.community = User.objects.create_user(
            email="comm@test.com",
            username="testcomm",
            password="password123",
            role="community",
            community_name="Test Community"
        )
        
        # Create representative
        self.rep = User.objects.create_user(
            email="rep@test.com",
            username="testrep",
            password="password123",
            role="student"
        )
        
        # Create public resource with NO file to test safety
        self.resource = Resource.objects.create(
            title="Test Resource",
            description="Testing 500 error",
            visibility="public",
            community=self.community,
            created_by_user=self.rep
        )

    def test_resource_list_unauthenticated(self):
        """Verify that ResourceListView returns 200 for unauthenticated users."""
        response = self.client.get("/contents/resources/")
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', [])
        # Should see the public resource
        self.assertTrue(len(results) >= 1)

    def test_resource_list_authenticated_student_no_membership(self):
        """Verify that ResourceListView returns 200 for student without membership."""
        self.client.force_authenticate(user=self.rep)
        response = self.client.get("/contents/resources/")
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', [])
        self.assertTrue(len(results) >= 1)
        # Author name should be handled safely even without membership
        self.assertEqual(results[0]['author_name'], "testrep (Member)")

    def test_resource_list_filter_community(self):
        """Verify that community filtering works safely."""
        response = self.client.get(f"/contents/resources/?community_id={self.community.id}")
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', [])
        self.assertTrue(len(results) >= 1)

    def test_resource_list_invalid_community_id(self):
        """Verify that invalid community_id handles gracefully."""
        response = self.client.get("/contents/resources/?community_id=not-a-uuid")
        self.assertEqual(response.status_code, 200)
