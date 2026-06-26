import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management System REST API",
      version: "1.0.0",
      description: `
Supports:
• JWT Authentication (via Cookies)
• RBAC (Role-Based Access Control)
• Project Management
• Task Assignment
• Comments
• Attachments
• Notifications

Note on Schemas: Manual schemas are defined here for Swagger documentation. Please ensure they remain synchronized with the underlying Zod validators and Prisma models if you make structural changes to the database.
      `,
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
      {
        url: "https://api.yourdomain.com",
        description: "Production server placeholder",
      },
    ],
    tags: [
      { name: "Authentication", description: "Endpoints for managing auth" },
      { name: "Users", description: "Endpoints for managing users and roles" },
      { name: "Projects", description: "Endpoints for managing projects" },
      { name: "Tasks", description: "Endpoints for managing tasks" },
      { name: "Comments", description: "Endpoints for task comments" },
      { name: "Attachments", description: "Endpoints for file uploads and management" },
      { name: "Notifications", description: "Endpoints for user notifications" },
      { name: "Dashboard", description: "Endpoints for aggregated metrics" },
      { name: "Admin", description: "Administrative endpoints" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "JWT access token stored in a secure HttpOnly cookie.",
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request - Invalid parameters or validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "Invalid input format" }
            }
          }
        },
        Unauthorized: {
          description: "Unauthorized - User is not logged in or token is invalid/expired",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "No token provided" }
            }
          }
        },
        Forbidden: {
          description: "Forbidden - User lacks required roles for this action",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "Unauthorized role" }
            }
          }
        },
        NotFound: {
          description: "Not Found - The requested resource does not exist",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "Resource not found" }
            }
          }
        },
        ServerError: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "An unexpected error occurred" }
            }
          }
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message details" }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object", nullable: true }
          }
        },
        User: {
          type: "object",
          properties: {
            user_id: { type: "integer", example: 1 },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", example: "john@example.com" },
            is_active: { type: "boolean", example: true },
            reset_token: { type: "string", nullable: true, example: "null" },
            reset_token_expires: { type: "string", format: "date-time", nullable: true, example: "null" },
            created_at: { type: "string", format: "date-time", example: "2023-10-25T14:30:00.000Z" },
            user_roles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: {
                    type: "object",
                    properties: {
                      role_id: { type: "integer", example: 2 },
                      role_name: { type: "string", example: "Project Manager" }
                    }
                  }
                }
              }
            }
          }
        },
        Project: {
          type: "object",
          properties: {
            project_id: { type: "integer", example: 101 },
            project_name: { type: "string", example: "Website Redesign" },
            description: { type: "string", example: "Overhaul the main corporate website." },
            start_date: { type: "string", format: "date-time", example: "2023-11-01T00:00:00.000Z" },
            end_date: { type: "string", format: "date-time", example: "2023-12-31T23:59:59.000Z" },
            status: { type: "string", example: "IN_PROGRESS" },
            created_at: { type: "string", format: "date-time", example: "2023-10-25T14:30:00.000Z" },
            created_by: { type: "integer", example: 1 }
          }
        },
        Task: {
          type: "object",
          description: `
Represents a task within a project.

**Task Status Workflow:**
\`\`\`
To Do
  ↓
In Progress
  ↓
Review
  ├── Completed
  └── In Progress (Rejected)
\`\`\`
          `,
          properties: {
            task_id: { type: "integer", example: 501 },
            project_id: { type: "integer", example: 101 },
            title: { type: "string", example: "Implement Login Interface" },
            description: { type: "string", example: "Build the React components for the login page." },
            priority: { type: "string", example: "HIGH" },
            status: { type: "string", example: "IN_PROGRESS" },
            due_date: { type: "string", format: "date-time", example: "2023-11-15T00:00:00.000Z" },
            created_at: { type: "string", format: "date-time", example: "2023-10-25T14:30:00.000Z" }
          }
        },
        Comment: {
          type: "object",
          properties: {
            comment_id: { type: "integer", example: 2001 },
            task_id: { type: "integer", example: 501 },
            user_id: { type: "integer", example: 3 },
            content: { type: "string", example: "I have finished the layout, moving on to API integration." },
            created_at: { type: "string", format: "date-time", example: "2023-10-26T10:00:00.000Z" }
          }
        },
        Attachment: {
          type: "object",
          properties: {
            attachment_id: { type: "integer", example: 3001 },
            task_id: { type: "integer", example: 501 },
            uploaded_by_user_id: { type: "integer", example: 3 },
            file_name: { type: "string", example: "login-mockup.png" },
            file_url: { type: "string", example: "https://vyxunfpwynglcmqdalto.supabase.co/storage/v1/object/public/task-attachments/login-mockup.png" },
            uploaded_at: { type: "string", format: "date-time", example: "2023-10-26T10:05:00.000Z" }
          }
        },
        Notification: {
          type: "object",
          properties: {
            notification_id: { type: "integer", example: 4001 },
            user_id: { type: "integer", example: 1 },
            title: { type: "string", example: "Task Status Updated" },
            message: { type: "string", example: "Task 'Implement Login' was moved to Review." },
            notification_type: { type: "string", example: "TASK_REVIEW" },
            is_read: { type: "boolean", example: false },
            created_at: { type: "string", format: "date-time", example: "2023-10-27T11:00:00.000Z" }
          }
        }
      }
    },
    security: [
      { cookieAuth: [] }
    ]
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
