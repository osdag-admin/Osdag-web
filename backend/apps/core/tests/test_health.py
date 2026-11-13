from unittest import mock

from django.test import SimpleTestCase


class HealthEndpointTest(SimpleTestCase):
    """DB and Redis are mocked so this runs without any services."""

    URL = "/api/health/"

    def test_healthy_when_db_and_redis_ok(self):
        with mock.patch("apps.core.health._check_database"), \
             mock.patch("apps.core.health._check_redis"):
            response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "checks": {"database": "ok", "redis": "ok"}},
        )

    def test_503_when_database_down(self):
        with mock.patch("apps.core.health._check_database", side_effect=Exception("boom")), \
             mock.patch("apps.core.health._check_redis"):
            response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertEqual(body["status"], "unavailable")
        self.assertEqual(body["checks"], {"database": "error", "redis": "ok"})
        self.assertNotIn("boom", response.content.decode())

    def test_503_when_redis_down(self):
        with mock.patch("apps.core.health._check_database"), \
             mock.patch("apps.core.health._check_redis", side_effect=Exception("down")):
            response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["checks"], {"database": "ok", "redis": "error"})

    def test_post_not_allowed(self):
        self.assertEqual(self.client.post(self.URL).status_code, 405)
