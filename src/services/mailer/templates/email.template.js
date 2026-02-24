export const welcomeTemplate = ({
  firstName = "User",
  organizationName = "",
  dashboardUrl = "#",
  userEmail = "",
  planName = "Free",
  workspaceUrl = "#",
  companyAddress = "",
  companyWebsite = "",
}) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">

    <h2>Welcome to Tenantrix – Your Workspace is Ready</h2>

    <p>Hi ${firstName},</p>

    <p>
      Welcome to Tenantrix.<br/><br/>
      Your account has been successfully created, and your organization 
      <b>${organizationName}</b> is now active.
    </p>

    <p>
      You can access your dashboard using the link below:
    </p>

    <p>👉 <a href="${dashboardUrl}">${dashboardUrl}</a></p>

    <h3>Account Details</h3>

    <p>Email: ${userEmail}</p>
    <p>Organization: ${organizationName}</p>
    <p>Current Plan: ${planName}</p>
    <p>Workspace URL: ${workspaceUrl}</p>

    <h3>Recommended Next Steps</h3>

    <ul>
      <li>Invite your team members</li>
      <li>Configure roles and permissions</li>
      <li>Complete organization settings</li>
      <li>Review your subscription plan</li>
    </ul>

    <p>
      If you need assistance, our support team is available at 
      support@tenantrix.com.
    </p>

    <p>
      If you did not create this account, please contact us immediately at 
      security@tenantrix.com.
    </p>

    <p>
      Thank you for choosing Tenantrix.
    </p>

    <p>
      Best regards,<br/>
      Tenantrix Team<br/>
      ${companyAddress}<br/>
      ${companyWebsite}
    </p>

  </div>
  `;
};

export const otpTemplate = (otpCode, name = "User") => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Verify your Tenantrix Account</h2>

    <p>Hi ${name},</p>

    <p>Welcome to <b>Tenantrix</b>. Use the OTP below to verify your account:</p>

    <h1 style="letter-spacing: 4px; color: #4CAF50;">${otpCode}</h1>

    <p>This OTP will expire in <b>10 minutes</b>.</p>

    <hr/>

    <p>If you did not request this, please ignore this email.</p>

    <p>— Tenantrix Team</p>
  </div>
  `;
};

