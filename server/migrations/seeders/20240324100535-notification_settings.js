// eslint-disable-next-line import/no-extraneous-dependencies
const notificationSettingsData = [
  {
    notification_name: 'new_chat',
    notification_description: 'Notification for new chat message',
  },
  {
    notification_name: 'new_notification',
    notification_description: 'Notification for new notification',
  },
  {
    notification_name: 'new_friend',
    notification_description:
      'Notification when your friend request is accepted',
  },
  {
    notification_name: 'new_like',
    notification_description: 'Notification for new like on your post',
  },
  {
    notification_name: 'new_comment',
    notification_description: 'Notification for new your comment',
  },
  {
    notification_name: 'new_follow',
    notification_description: 'Notification when you get a new follower',
  },
  {
    notification_name: 'new_comment_like',
    notification_description: 'Notification for new like on your comment',
  },
  {
    notification_name: 'new_comment_reply',
    notification_description: 'Notification for new reply on your comment',
  },
  {
    notification_name: 'new_friend_request',
    notification_description: 'Notification for new friend request',
  },
  {
    notification_name: 'new_post_mention',
    notification_description: 'Notification for mention in a post',
  },
  {
    notification_name: 'new_community_invitation',
    notification_description: 'Notification for new community invitation',
  },
  {
    notification_name: 'new_blog_response',
    notification_description: 'Notification for new response on your blog',
  },
];

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert(
      'notification_settings',
      notificationSettingsData
    );
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('notification_settings', null, {});
  },
};
