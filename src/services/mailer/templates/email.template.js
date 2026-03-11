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

export const resetPasswordTemplate = (name,resetLink,expiryTime = 10) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">

      <h2>Reset Your Password – Tenantrix</h2>

      <p>Hi ${name},</p>

      <p>
        We received a request to reset your password for your Tenantrix account.
      </p>

      <p>
        Click the link below to set a new password:
      </p>

      <p>
        👉 <a href="${resetLink}">${resetLink}</a>
      </p>

      <p>
        This link will expire in <strong>${expiryTime}</strong> minutes for security reasons.
      </p>

      <p>
        If you did not request a password reset, please ignore this email.
        Your account will remain secure.
      </p>

      <p>
        If you need help, feel free to contact our support team.
      </p>

      <br/>

      <p>
        Best regards,<br/>
        <strong>Team Tenantrix</strong>
      </p>

    </div>
  `;
};

export const passwordResetSuccessTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>Password Changed Successfully</h2>

      <p>Hi ${name},</p>

      <p>Your password for your <b>Tenantrix</b> account has been successfully updated.</p>

      <p>If you made this change, no further action is required.</p>

      <p><b>If you did not perform this action, please contact our support team immediately.</b></p>

      <br/>

      <p>For security reasons we recommend:</p>

      <ul>
        <li>Review your account activity</li>
        <li>Update your password again</li>
      </ul>

      <br/>

      <p>Best regards,</p>
      <p><b>Team Tenantrix</b></p>
    </div>
  `;
};