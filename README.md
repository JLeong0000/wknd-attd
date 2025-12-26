# Attendance Generator

#### Video Demo: https://www.youtube.com/watch?v=pAAHUW3GQPc

#### Description:

Attendance Generator is a full-stack web application designed to help my church small group manage and track attendance statuses for the members. Built as my final project for Harvard's CS50 course, this application allows users to manage a list of people, update their attendance statuses (e.g., "Serving", "Sitting", "TBC"), and generate formatted attendance reports with a single click.

## Features

-   **Real-time Status Management**: Update attendance statuses for multiple people across different categories (Service 1, Service 2, Service 3, Serving, TBC, Others)
-   **Dual Mode Interface**:
    -   **Default Mode**: View and update current attendance
    -   **Edit Mode**: Modify the default list of people and their statuses
-   **Formatted Output**: Generate and copy beautifully formatted attendance messages to clipboard with proper Unicode formatting
-   **Real-time Synchronization**: Uses Supabase for real-time data synchronization across multiple devices
-   **PWA Support**: Installable as a Progressive Web App for offline access
-   **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technical Implementation

The application is built with:

-   **Frontend**: React with TypeScript for type-safe development
-   **Backend**: Supabase (PostgreSQL database with real-time capabilities)
-   **Styling**: Tailwind CSS for responsive design
-   **Icons**: React Icons for consistent UI elements
-   **State Management**: React hooks (useState, useEffect, useCallback, useMemo)
