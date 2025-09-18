# Improvement suggestions

1 :- If we go with the Stored Procedures only for get methods using dapper, we can improve the performance of the application , all the functionalities will be handled in single store procedure like searching , sorting , pagination , filtering , etc.

2 :- we can also improve the performance of the application by using caching mechanism like Redis or Memcached.

3 :- we can also improve the performance of the application if get the image one by one in the carousel view, we can use lazy loading to load the images only when the user scrolls to the next image. like using pagniation of the store procedure

4 :- using debouncing and throttling technique we can improve the performance of the application by reducing the number of requests to the server.

# Customer Lead Images Management System

A comprehensive full-stack application for managing customer and lead profile images with advanced features including automatic limit handling, priority-based image management, and a modern responsive UI.

## Project Overview

This application implements the client requirements for image upload functionality with the following key features:

- **10-Image Limit**: Automatic enforcement per customer/lead profile
- **Base64 Storage**: Images stored as Base64-encoded strings in the database
- **Smart Replacement**: Automatically replaces oldest non-priority images when limit is reached
- **Priority Management**: Protect important images from auto-deletion
- **Modern UI**: Responsive React frontend with multiple view modes (Grid, List, Carousel)
- **RESTful API**: Complete backend API with Swagger documentation

## Architecture

### Backend (C# .NET 8)

- **Clean Architecture** with four distinct layers:
  - **Domain**: Core business entities and models
  - **Application**: Business logic, services, and DTOs
  - **Infrastructure**: Data access and external services
  - **CustomerLeadImages**: ASP.NET Core Web API presentation layer

### Frontend (React/TypeScript)

- **Modern React** application with Vite build system
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hot Toast** for notifications

## Quick Start

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (or compatible database)

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd CustomerLeadImages
   ```

2. **Update database connection string**
   Edit `CustomerLeadImages/appsettings.json`:

   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=your-server;Database=CustomerLeadImages;Trusted_Connection=True;"
     }
   }
   ```

3. **Run database migrations**

   ```bash
   dotnet ef database update
   ```

4. **Run the backend API**

   ```bash
   change the connection string in appsettings.json to your own server,
   update the database with migration if migration is not done, first of all run the migrations and then run the update command,
   visual studio package manager console, navigate to CustomerLeadImages directory and run the following
   add-migration InitialCreate/any-name-you-like,
   update-database,
   dotnet run
   ```

5. **Access Swagger UI**
   Navigate to `https://localhost:7106/swagger`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd CustomerLeadImagesFrontEnd/CLIFrontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   Navigate to `http://localhost:5173`

## Complete User Flow

### 1. Profile Management

#### Create a New Profile

1. Open the application at `http://localhost:5173`
2. Click "Create Profile" button
3. Fill in profile details:
   - Profile Type: Customer or Lead
   - Full Name
   - Email Address
4. Click "Create Profile"

#### View Existing Profiles

- Profiles are displayed in organized sections (Customers/Leads)
- Each profile card shows:
  - Profile name and email
  - Image count (e.g., "3/10 images")
  - Creation date
  - Action buttons (View Images, Edit, Delete)

### 2. Image Management

#### Upload Images

1. Click "View Images" on any profile card
2. Click "Upload Images" button
3. Select images using the drag-and-drop interface or file browser
4. Preview selected images with file details
5. Click "Upload" to process images

**Upload Behavior:**

- Maximum 10 images per profile
- Automatic validation (file type, size < 5MB)
- Smart replacement when limit exceeded:
  - Replaces oldest non-priority images first
  - Preserves priority images
  - Shows clear feedback about replacements

#### View Images

Three viewing modes available:

**Grid View (Default):**

- Responsive grid layout
- Priority images shown first with special styling
- Hover effects for actions

**List View:**

- Detailed list with metadata
- File size and upload date
- Inline action buttons

**Carousel View:**

- Full-screen image viewing
- Navigation arrows
- Image details overlay

#### Manage Image Priority

1. Click the star icon on any image
2. Priority images are protected from auto-deletion
3. Visual indicators show priority status

#### Delete Images

1. Click the delete button (trash icon) on any image
2. Confirm deletion in the popup
3. Image is permanently removed

## 🔧 API Endpoints

### Profile Management

```
GET    /api/profiles           # Get all profiles
GET    /api/profiles/{id}      # Get profile by ID
POST   /api/profiles           # Create new profile
PUT    /api/profiles/{id}      # Update profile
DELETE /api/profiles/{id}      # Delete profile
```

### Image Management

```
GET    /api/{profileType}/{profileId}/images           # Get all images
POST   /api/{profileType}/{profileId}/images           # Upload images
DELETE /api/{profileType}/{profileId}/images/{imageId} # Delete image
PATCH  /api/{profileType}/{profileId}/images/{imageId}/priority # Toggle priority
GET    /api/{profileType}/{profileId}/images/count     # Get image count
```

### Upload Request Example

```json
{
  "Base64Images": ["iVBORw0KGgoAAAANSUhEUgAA...", "..."],
  "FileNames": ["image1.jpg", "image2.png"]
}
```

### Upload Response Example

```json
{
  "success": true,
  "message": "Successfully uploaded 2 image(s)",
  "ImagesUploaded": 2,
  "RemainingSlots": 8,
  "Images": [
    {
      "id": 1,
      "fileName": "image1.jpg",
      "contentType": "image/jpeg",
      "uploadedAt": "2025-01-16T12:00:00Z",
      "displayOrder": 1,
      "isPriority": false
    }
  ]
}
```

## UI Features

### Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### Interactive Elements

- Drag-and-drop file upload
- Real-time image previews
- Loading states and progress indicators
- Toast notifications for user feedback

### Advanced Features

- Image carousel with navigation
- Priority image management
- File validation and error handling
- Bulk upload capabilities

## Validation & Security

### File Validation

- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum Size**: 5MB per image
- **Base64 Format**: Strict validation
- **File Names**: Invalid character checking

### Business Rules

- **10-Image Limit**: Enforced per profile
- **Priority Protection**: Priority images excluded from auto-replacement
- **Profile Type Validation**: Ensures profile type consistency
- **Atomic Operations**: Database transactions for data integrity

## Testing Scenarios

### Upload Scenarios

1. **Normal Upload**: Upload images within limit
2. **Limit Exceeded**: Upload when at limit (auto-replace oldest)
3. **Priority Protection**: Verify priority images aren't replaced
4. **Batch Upload**: Upload multiple images simultaneously
5. **Validation**: Test invalid files and formats

### Error Scenarios

- Invalid Base64 strings
- Unsupported file formats
- File size exceeded
- Profile not found
- Profile type mismatch

## Data Flow

1. **Frontend**: User selects images → Converts to Base64 → Sends to API
2. **Backend**: Validates request → Checks profile limits → Processes images → Stores in database
3. **Database**: Stores Base64 data with metadata (filename, content type, priority, etc.)
4. **Response**: Returns success/failure with details about uploaded images

## Database Schema

### Profiles Table

```sql
CREATE TABLE Profiles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProfileType NVARCHAR(MAX) NOT NULL,
    Name NVARCHAR(MAX) NOT NULL,
    Email NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL
);
```

### ProfileImages Table

```sql
CREATE TABLE ProfileImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProfileId INT NOT NULL,
    ImageData NVARCHAR(MAX) NOT NULL,  -- Base64 data
    FileName NVARCHAR(MAX) NOT NULL,
    ContentType NVARCHAR(MAX) NOT NULL,
    UploadedAt DATETIME2 NOT NULL,
    DisplayOrder INT NOT NULL,
    IsPriority BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (ProfileId) REFERENCES Profiles(Id) ON DELETE CASCADE
);
```

## Deployment

### Backend Deployment

1. Publish the .NET application
2. Update connection strings for production database
3. Configure CORS for frontend domain
4. Set up SSL certificates

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy static files to web server
3. Update API base URL in production
4. Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

---

## Client Requirements Fulfillment

✅ **10-image limit per customer/lead profile** - Implemented with smart replacement logic  
✅ **Base64-encoded image storage** - Images stored as Base64 strings in database  
✅ **API endpoints for upload, list, delete** - Complete RESTful API implemented  
✅ **Backend in C#** - ASP.NET Core Web API with Clean Architecture  
✅ **Frontend bonus task** - Modern React application with advanced features  
✅ **Image carousel/gallery** - Multiple view modes including carousel  
✅ **User-friendly UI** - Intuitive interface with drag-and-drop upload

The implementation exceeds the basic requirements with advanced features like priority management, multiple view modes, comprehensive validation, and a polished user experience.
