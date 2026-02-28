from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings
from .services import NotificationService

# 1. Membership / Role Change
@receiver(pre_save, sender=settings.AUTH_USER_MODEL)
def notify_role_change(sender, instance, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if instance.pk:
        try:
            old_instance = User.objects.get(pk=instance.pk)
            if old_instance.role != instance.role:
                NotificationService.create_notification(
                    recipient=instance,
                    type='role_change',
                    title='Role Updated',
                    message=f'Your role has been changed from {old_instance.role} to {instance.role}.',
                    metadata={'new_role': instance.role}
                )
        except User.DoesNotExist:
            pass

@receiver(post_save, sender='communities.CommunityMembership')
def notify_membership_change(sender, instance, created, **kwargs):
    if created:
        NotificationService.create_notification(
            recipient=instance.user,
            type='membership',
            title='Joined Community',
            message=f'You are now a {instance.role} of {instance.community.community_name}.',
            actor=instance.community,
            metadata={'community_id': str(instance.community.id)}
        )

# 2. Vacancy / Recruitment
@receiver(post_save, sender='communities.VacancyApplication')
def notify_new_application(sender, instance, created, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if created:
        # Notify community admin
        NotificationService.create_notification(
            recipient=instance.vacancy.community,
            type='vacancy',
            title='New Application Received',
            message=f'{instance.user.username} applied for {instance.vacancy.title}.',
            actor=instance.user,
            metadata={'vacancy_id': str(instance.vacancy.id), 'application_id': str(instance.id)}
        )
        # Notify representatives
        representatives = User.objects.filter(
            membership__community=instance.vacancy.community,
            membership__role='representative'
        )
        NotificationService.notify_group(
            users=representatives,
            type='vacancy',
            title='New Application Received',
            message=f'{instance.user.username} applied for {instance.vacancy.title}.',
            actor=instance.user,
            metadata={'vacancy_id': str(instance.vacancy.id)}
        )

@receiver(post_save, sender='communities.CommunityVacancy')
def notify_vacancy_actions(sender, instance, created, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if created:
        # Notify all students
        students = User.objects.filter(role='student', status='active')
        NotificationService.notify_group(
            users=students,
            type='vacancy',
            title='New Vacancy Opened',
            message=f'{instance.community.community_name} has a new vacancy: {instance.title}.',
            actor=instance.community,
            metadata={'vacancy_id': str(instance.id)}
        )
    # Check if closed
    elif instance.is_open == False:
        applicants = User.objects.filter(vacancy_applications__vacancy=instance)
        NotificationService.notify_group(
            users=applicants,
            type='vacancy',
            title='Vacancy Closed',
            message=f'The vacancy "{instance.title}" you applied for has been closed.',
            actor=instance.community,
            metadata={'vacancy_id': str(instance.id)}
        )

# 3. Events
@receiver(post_save, sender='events.Event')
def notify_event_actions(sender, instance, created, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if created:
        # Notify all community members
        from communities.models import CommunityMembership
        members = User.objects.filter(membership__community=instance.community)
        NotificationService.notify_group(
            users=members,
            type='event',
            title='New Event Created',
            message=f'A new event "{instance.title}" has been scheduled for {instance.date}.',
            actor=instance.community,
            metadata={'event_id': str(instance.id)}
        )

@receiver(pre_save, sender='events.Event')
def notify_event_update(sender, instance, **kwargs):
    if instance.pk:
        from events.models import Event
        try:
            old_event = Event.objects.get(pk=instance.pk)
            changes = []
            if old_event.date != instance.date:
                changes.append(f"date to {instance.date}")
            if old_event.start_time != instance.start_time or old_event.end_time != instance.end_time:
                changes.append("time")
            if old_event.location != instance.location:
                changes.append(f"location to {instance.location}")

            if changes:
                # Notify attendees
                from django.contrib.auth import get_user_model
                User = get_user_model()
                attendees = User.objects.filter(event_registrations__event=instance)
                change_text = ", ".join(changes)
                NotificationService.notify_group(
                    users=attendees,
                    type='event',
                    title='Event Updated',
                    message=f'The event "{instance.title}" has been updated: {change_text}.',
                    actor=instance.community,
                    metadata={'event_id': str(instance.id)}
                )
        except Event.DoesNotExist:
            pass

@receiver(post_save, sender='events.EventRegistration')
def notify_event_registration(sender, instance, created, **kwargs):
    if created:
        # Notify event creator/community
        NotificationService.create_notification(
            recipient=instance.event.community,
            type='event',
            title='New Registration',
            message=f'{instance.user.username} registered for your event: {instance.event.title}',
            actor=instance.user,
            metadata={'event_id': str(instance.event.id)}
        )

# 4. Announcements
@receiver(post_save, sender='contents.Announcement')
def notify_announcement(sender, instance, created, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if created:
        members = User.objects.filter(membership__community=instance.community)
        NotificationService.notify_group(
            users=members,
            type='announcement',
            title='New Announcement',
            message=instance.title,
            actor=instance.community,
            metadata={'announcement_id': str(instance.id)}
        )

# 5. Discussions
@receiver(post_save, sender='discussion.DiscussionReply')
def notify_discussion_reply(sender, instance, created, **kwargs):
    if created:
        # Notify discussion owner
        if instance.topic.created_by != instance.created_by:
            NotificationService.create_notification(
                recipient=instance.topic.created_by,
                type='discussion',
                title='New Reply on Your Discussion',
                message=f'{instance.created_by.username} replied to your discussion: {instance.topic.topic}',
                actor=instance.created_by,
                metadata={'discussion_id': str(instance.topic.id)}
            )

# 6. Posts
@receiver(post_save, sender='contents.PostComment')
def notify_post_comment(sender, instance, created, **kwargs):
    if created:
        if instance.post.author != instance.author:
            NotificationService.create_notification(
                recipient=instance.post.author,
                type='post',
                title='New Comment on Your Post',
                message=f'{instance.author.username} commented on your post.',
                actor=instance.author,
                metadata={'post_id': str(instance.post.id)}
            )
        # Reply to comment
        if instance.parent_comment and instance.parent_comment.author != instance.author:
            NotificationService.create_notification(
                recipient=instance.parent_comment.author,
                type='post',
                title='New Reply to Your Comment',
                message=f'{instance.author.username} replied to your comment.',
                actor=instance.author,
                metadata={'post_id': str(instance.post.id), 'comment_id': str(instance.id)}
            )

# 7. Resources
@receiver(post_save, sender='contents.Resource')
def notify_resource_upload(sender, instance, created, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if created:
        members = User.objects.filter(membership__community=instance.community)
        NotificationService.notify_group(
            users=members,
            type='resource',
            title='New Resource Uploaded',
            message=f'A new resource "{instance.title}" is available in {instance.community.community_name}.',
            actor=instance.community,
            metadata={'resource_id': str(instance.id)}
        )
