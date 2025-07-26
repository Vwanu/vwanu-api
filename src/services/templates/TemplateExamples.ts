/**
 * Example usage of the Template model for dynamic email/notification templates
 */

import Template  from '../../database/template';

// Example: Setting up email templates for notifications
export async function setupNotificationTemplates() {
  console.log('Setting up notification email templates...');

  const templates = [
    {
      snug: 'new_comment_email',
      templateBody: `
        <h2>New Comment on Your Post</h2>
        <p>Hi {{userName}},</p>
        <p>{{commenterName}} commented on your post:</p>
        <blockquote>{{commentText}}</blockquote>
        <p>
          <a href="{{postUrl}}">View Post</a>
        </p>
        <p>Best regards,<br>{{siteName}} Team</p>
      `,
      requiredFields: {
        userName: 'string',
        commenterName: 'string', 
        commentText: 'string',
        postUrl: 'string',
        siteName: 'string'
      }
    },
    {
      snug: 'friend_request_email',
      templateBody: `
        <h2>New Friend Request</h2>
        <p>Hi {{userName}},</p>
        <p>{{requesterName}} sent you a friend request.</p>
        <p>{{requesterBio}}</p>
        <p>
          <a href="{{acceptUrl}}">Accept</a> | 
          <a href="{{declineUrl}}">Decline</a>
        </p>
        <p>Best regards,<br>{{siteName}} Team</p>
      `,
      requiredFields: {
        userName: 'string',
        requesterName: 'string',
        requesterBio: 'string',
        acceptUrl: 'string',
        declineUrl: 'string',
        siteName: 'string'
      }
    },
    {
      snug: 'community_invitation_email',
      templateBody: `
        <h2>Community Invitation</h2>
        <p>Hi {{userName}},</p>
        <p>{{inviterName}} invited you to join the community "{{communityName}}".</p>
        <p>{{communityDescription}}</p>
        <p>
          <a href="{{joinUrl}}">Join Community</a>
        </p>
        <p>Best regards,<br>{{siteName}} Team</p>
      `,
      requiredFields: {
        userName: 'string',
        inviterName: 'string',
        communityName: 'string',
        communityDescription: 'string',
        joinUrl: 'string',
        siteName: 'string'
      }
    },
    {
      snug: 'post_mention_sms',
      templateBody: `Hi {{userName}}! {{mentionerName}} mentioned you in a post. Check it out: {{postUrl}}`,
      requiredFields: {
        userName: 'string',
        mentionerName: 'string',
        postUrl: 'string'
      }
    }
  ];

  for (const templateData of templates) {
    try {
      await Template.create(templateData);
      console.log(`✓ Created template: ${templateData.snug}`);
    } catch (error) {
      console.error(`✗ Failed to create template ${templateData.snug}:`, error);
    }
  }
}

// Example: Using templates to generate notification content
export async function generateNotificationContent(
  templateSlug: string,
  data: Record<string, unknown>
): Promise<{
  success: boolean;
  content?: string;
  errors?: string[];
}> {
  try {
    const template :any = {}
    //await Template.findOne({ where: { snug: templateSlug } });
    
    if (!template) {
      return {
        success: false,
        errors: [`Template '${templateSlug}' not found`]
      };
    }

    // Validate required fields
    const validation = template.validateRequiredFields(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: [`Missing required fields: ${validation.missingFields.join(', ')}`]
      };
    }

    // Check template syntax
    if (!template.isValidTemplate()) {
      return {
        success: false,
        errors: ['Template has invalid syntax']
      };
    }

    // Render the template
    const content = template.renderTemplate(data);

    return {
      success: true,
      content
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Template processing error: ${error}`]
    };
  }
}

// Example: Integration with notification service
export async function sendTemplatedNotification(
  templateSlug: string,
  recipientData: {
    userId: string;
    email: string;
    phone?: string;
  },
  templateData: Record<string, unknown>
) {
  console.log(`Sending templated notification using ${templateSlug}`);

  // Generate content from template
  const result = await generateNotificationContent(templateSlug, templateData);
  
  if (!result.success) {
    console.error('Template generation failed:', result.errors);
    return;
  }

  console.log('Generated content:', result.content);

  // Determine notification type and send accordingly
  if (templateSlug.includes('email')) {
    console.log('📧 Sending email notification');
    // await sendEmail(recipientData.email, result.content);
  } else if (templateSlug.includes('sms')) {
    console.log('📱 Sending SMS notification');
    // await sendSMS(recipientData.phone, result.content);
  } else {
    console.log('📱 Creating in-app notification');
    // await createInAppNotification(recipientData.userId, result.content);
  }
}

// Example: Template management functions
export class TemplateManager {
  
  public static async createTemplate(
    snug: string,
    templateBody: string,
    requiredFields: Record<string, string>
  ): Promise<Template> {
    return Template.create({
      snug,
      templateBody,
      requiredFields
    });
  }

  public static async updateTemplate(
    snug: string,
    updates: Partial<{
      templateBody: string;
      requiredFields: Record<string, string>;
    }>
  ): Promise<boolean> {
    const template = await Template.findOne({ where: { snug } });
    if (!template) return false;

    if (updates.templateBody) template.templateBody = updates.templateBody;
    if (updates.requiredFields) template.requiredFields = updates.requiredFields;

    await template.save();
    return true;
  }

  public static async getTemplateInfo(snug: string): Promise<{
    exists: boolean;
    variables?: string[];
    requiredFields?: string[];
    isValid?: boolean;
    length?: number;
  }> {
    const template = await Template.findOne({ where: { snug } });
    
    if (!template) {
      return { exists: false };
    }

    return {
      exists: true,
      variables: template.getTemplateVariables(),
      requiredFields: template.getRequiredFieldNames(),
      isValid: template.isValidTemplate(),
      length: template.getTemplateLength()
    };
  }

  public static async getAllTemplates(): Promise<Array<{
    snug: string;
    displayName: string;
    variables: string[];
    requiredFields: string[];
  }>> {
    const templates = await Template.findAll();
    
    return templates.map(template => ({
      snug: template.snug,
      displayName: template.getDisplayName(),
      variables: template.getTemplateVariables(),
      requiredFields: template.getRequiredFieldNames()
    }));
  }

  public static async testTemplate(
    snug: string,
    testData: Record<string, unknown>
  ): Promise<{
    success: boolean;
    renderedContent?: string;
    validationErrors?: string[];
    templateErrors?: string[];
  }> {
    const template = await Template.findOne({ where: { snug } });
    
    if (!template) {
      return {
        success: false,
        templateErrors: ['Template not found']
      };
    }

    const validation = template.validateRequiredFields(testData);
    const isValidSyntax = template.isValidTemplate();

    if (!validation.isValid || !isValidSyntax) {
      return {
        success: false,
        validationErrors: validation.missingFields,
        templateErrors: isValidSyntax ? [] : ['Invalid template syntax']
      };
    }

    const renderedContent = template.renderTemplate(testData);

    return {
      success: true,
      renderedContent
    };
  }
}

// Example usage scenarios
export async function exampleUsage() {
  console.log('=== Template System Examples ===');

  // 1. Setup templates
  await setupNotificationTemplates();

  // 2. Generate content for a friend request email
  const friendRequestData = {
    userName: 'John Doe',
    requesterName: 'Jane Smith',
    requesterBio: 'Software developer interested in connecting',
    acceptUrl: 'https://app.com/friends/accept/123',
    declineUrl: 'https://app.com/friends/decline/123',
    siteName: 'My Social App'
  };

  const emailResult = await generateNotificationContent(
    'friend_request_email',
    friendRequestData
  );

  if (emailResult.success) {
    console.log('Generated email:', emailResult.content);
  }

  // 3. Generate SMS content for post mention
  const smsData = {
    userName: 'John',
    mentionerName: 'Jane',
    postUrl: 'https://app.com/posts/456'
  };

  const smsResult = await generateNotificationContent(
    'post_mention_sms',
    smsData
  );

  if (smsResult.success) {
    console.log('Generated SMS:', smsResult.content);
  }

  // 4. Get template information
  const templateInfo = await TemplateManager.getTemplateInfo('new_comment_email');
  console.log('Template info:', templateInfo);

  // 5. Test a template
  const testResult = await TemplateManager.testTemplate('new_comment_email', {
    userName: 'John',
    commenterName: 'Jane',
    commentText: 'Great post!',
    postUrl: 'https://app.com/posts/789',
    siteName: 'My App'
  });

  console.log('Test result:', testResult);
}
