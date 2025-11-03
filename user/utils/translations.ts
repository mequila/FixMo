// Translation system for English and Filipino (Tagalog)

export type Language = 'en' | 'fil';

export interface Translations {
  // Navigation & Tabs
  home: string;
  bookings: string;
  messages: string;
  profile: string;
  
  // Profile Screen
  editProfile: string;
  fixScore: string;
  reportAnIssue: string;
  faq: string;
  language: string;
  termsAndConditions: string;
  logout: string;
  
  // Common Actions
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  ok: string;
  save: string;
  delete: string;
  edit: string;
  back: string;
  submit: string;
  search: string;
  filter: string;
  close: string;
  retry: string;
  
  // Bookings
  scheduled: string;
  ongoing: string;
  completed: string;
  cancelled: string;
  noShow: string;
  providerNoShow: string;
  viewDetails: string;
  bookNow: string;
  cancelBooking: string;
  rateService: string;
  contactProvider: string;
  reportNoShow: string;
  noBookingsFound: string;
  noScheduledBookings: string;
  noOngoingBookings: string;
  noCompletedBookings: string;
  noCancelledBookings: string;
  bookingDetails: string;
  serviceProvider: string;
  serviceType: string;
  dateTime: string;
  location: string;
  status: string;
  totalPrice: string;
  paymentMethod: string;
  
  // Messages
  noMessages: string;
  sendMessage: string;
  typeMessage: string;
  newMessage: string;
  
  // Search & Filter
  searchServices: string;
  searchProviders: string;
  searchBookings: string;
  filterBy: string;
  sortBy: string;
  
  // Home Screen
  findServices: string;
  popularServices: string;
  topRatedProviders: string;
  emergencyServices: string;
  viewAll: string;
  nearYou: string;
  
  // Account & Profile
  accountDeactivated: string;
  accountDeactivatedMessage: string;
  reactivateAccount: string;
  verifyAccount: string;
  verificationPending: string;
  verificationRejected: string;
  accountSettings: string;
  personalInfo: string;
  changePassword: string;
  
  // Language Selection
  selectLanguage: string;
  english: string;
  filipino: string;
  languageChanged: string;
  
  // Fix Score
  fixScoreTitle: string;
  currentScore: string;
  penalties: string;
  violations: string;
  appeal: string;
  history: string;
  
  // Reports
  reportType: string;
  bugReport: string;
  feedback: string;
  complaint: string;
  description: string;
  attachImages: string;
  
  // Ratings
  rateYourExperience: string;
  writeReview: string;
  rating: string;
  reviews: string;
  
  // Notifications
  notifications: string;
  noNotifications: string;
  markAsRead: string;
  
  // Errors & Alerts
  networkError: string;
  somethingWentWrong: string;
  pleaseCheckConnection: string;
  sessionExpired: string;
  unauthorized: string;
  
  // Service Booking
  selectDate: string;
  selectTime: string;
  selectLocation: string;
  confirmBooking: string;
  bookingConfirmed: string;
  bookingCancelled: string;
  
  // Payment
  payment: string;
  paymentSuccessful: string;
  paymentFailed: string;
  payNow: string;
  paymentDetails: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Tabs
    home: 'Home',
    bookings: 'Bookings',
    messages: 'Messages',
    profile: 'Profile',
    
    // Profile Screen
    editProfile: 'Edit Profile',
    fixScore: 'Fix-Score',
    reportAnIssue: 'Report an Issue',
    faq: 'FAQ',
    language: 'Language',
    termsAndConditions: 'Terms and Conditions',
    logout: 'Logout',
    
    // Common Actions
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    ok: 'OK',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    close: 'Close',
    retry: 'Retry',
    
    // Bookings
    scheduled: 'Scheduled',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noShow: 'No-Show',
    providerNoShow: 'Provider No-Show',
    viewDetails: 'View Details',
    bookNow: 'Book Now',
    cancelBooking: 'Cancel Booking',
    rateService: 'Rate Service',
    contactProvider: 'Contact Provider',
    reportNoShow: 'Report No-Show',
    noBookingsFound: 'No bookings found',
    noScheduledBookings: 'No scheduled bookings',
    noOngoingBookings: 'No ongoing bookings',
    noCompletedBookings: 'No completed bookings',
    noCancelledBookings: 'No cancelled bookings',
    bookingDetails: 'Booking Details',
    serviceProvider: 'Service Provider',
    serviceType: 'Service Type',
    dateTime: 'Date & Time',
    location: 'Location',
    status: 'Status',
    totalPrice: 'Total Price',
    paymentMethod: 'Payment Method',
    
    // Messages
    noMessages: 'No messages yet',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    newMessage: 'New Message',
    
    // Search & Filter
    searchServices: 'Search services...',
    searchProviders: 'Search providers...',
    searchBookings: 'Search bookings...',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    
    // Home Screen
    findServices: 'Find Services',
    popularServices: 'Popular Services',
    topRatedProviders: 'Top Rated Providers',
    emergencyServices: 'Emergency Services',
    viewAll: 'View All',
    nearYou: 'Near You',
    
    // Account & Profile
    accountDeactivated: 'Account Deactivated',
    accountDeactivatedMessage: 'Your account has been deactivated due to your Fix-Score falling below 50 points.',
    reactivateAccount: 'Reactivate Account',
    verifyAccount: 'Verify Account',
    verificationPending: 'Verification Pending',
    verificationRejected: 'Verification Rejected',
    accountSettings: 'Account Settings',
    personalInfo: 'Personal Information',
    changePassword: 'Change Password',
    
    // Language Selection
    selectLanguage: 'Select Language',
    english: 'English',
    filipino: 'Filipino',
    languageChanged: 'Language changed successfully',
    
    // Fix Score
    fixScoreTitle: 'Fix-Score',
    currentScore: 'Current Score',
    penalties: 'Penalties',
    violations: 'Violations',
    appeal: 'Appeal',
    history: 'History',
    
    // Reports
    reportType: 'Report Type',
    bugReport: 'Bug Report',
    feedback: 'Feedback',
    complaint: 'Complaint',
    description: 'Description',
    attachImages: 'Attach Images',
    
    // Ratings
    rateYourExperience: 'Rate Your Experience',
    writeReview: 'Write a Review',
    rating: 'Rating',
    reviews: 'Reviews',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAsRead: 'Mark as Read',
    
    // Errors & Alerts
    networkError: 'Network Error',
    somethingWentWrong: 'Something went wrong',
    pleaseCheckConnection: 'Please check your connection',
    sessionExpired: 'Session Expired',
    unauthorized: 'Unauthorized',
    
    // Service Booking
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    selectLocation: 'Select Location',
    confirmBooking: 'Confirm Booking',
    bookingConfirmed: 'Booking Confirmed',
    bookingCancelled: 'Booking Cancelled',
    
    // Payment
    payment: 'Payment',
    paymentSuccessful: 'Payment Successful',
    paymentFailed: 'Payment Failed',
    payNow: 'Pay Now',
    paymentDetails: 'Payment Details',
  },
  fil: {
    // Navigation & Tabs
    home: 'Home',
    bookings: 'Mga Booking',
    messages: 'Mga Mensahe',
    profile: 'Profile',
    
    // Profile Screen
    editProfile: 'Baguhin ang Profile',
    fixScore: 'Fix-Score',
    reportAnIssue: 'Mag-ulat ng Isyu',
    faq: 'Mga Madalas Itanong',
    language: 'Wika',
    termsAndConditions: 'Mga Tuntunin at Kondisyon',
    logout: 'Mag-logout',
    
    // Common Actions
    loading: 'Naglo-load...',
    error: 'May Mali',
    success: 'Tagumpay',
    cancel: 'Kanselahin',
    confirm: 'Kumpirmahin',
    ok: 'OK',
    save: 'I-save',
    delete: 'Tanggalin',
    edit: 'Baguhin',
    back: 'Bumalik',
    submit: 'Ipasa',
    search: 'Maghanap',
    filter: 'I-filter',
    close: 'Isara',
    retry: 'Subukan Muli',
    
    // Bookings
    scheduled: 'Nakatakda',
    ongoing: 'Kasalukuyan',
    completed: 'Tapos Na',
    cancelled: 'Kinansela',
    noShow: 'Hindi Dumating',
    providerNoShow: 'Hindi Dumating ang Provider',
    viewDetails: 'Tingnan ang Detalye',
    bookNow: 'Mag-book Ngayon',
    cancelBooking: 'Kanselahin ang Booking',
    rateService: 'I-rate ang Serbisyo',
    contactProvider: 'Kontakin ang Provider',
    reportNoShow: 'Mag-ulat ng Hindi Pagdating',
    noBookingsFound: 'Walang nakitang booking',
    noScheduledBookings: 'Walang nakatakdang booking',
    noOngoingBookings: 'Walang kasalukuyang booking',
    noCompletedBookings: 'Walang tapos na booking',
    noCancelledBookings: 'Walang kinansela na booking',
    bookingDetails: 'Detalye ng Booking',
    serviceProvider: 'Service Provider',
    serviceType: 'Uri ng Serbisyo',
    dateTime: 'Petsa at Oras',
    location: 'Lokasyon',
    status: 'Katayuan',
    totalPrice: 'Kabuuang Halaga',
    paymentMethod: 'Paraan ng Pagbabayad',
    
    // Messages
    noMessages: 'Walang mensahe pa',
    sendMessage: 'Magpadala ng Mensahe',
    typeMessage: 'Mag-type ng mensahe...',
    newMessage: 'Bagong Mensahe',
    
    // Search & Filter
    searchServices: 'Maghanap ng serbisyo...',
    searchProviders: 'Maghanap ng provider...',
    searchBookings: 'Maghanap ng booking...',
    filterBy: 'I-filter ayon sa',
    sortBy: 'Ayusin ayon sa',
    
    // Home Screen
    findServices: 'Maghanap ng Serbisyo',
    popularServices: 'Sikat na Serbisyo',
    topRatedProviders: 'Pinakamataas na Rating',
    emergencyServices: 'Emergency na Serbisyo',
    viewAll: 'Tingnan Lahat',
    nearYou: 'Malapit sa Iyo',
    
    // Account & Profile
    accountDeactivated: 'Na-deactivate ang Account',
    accountDeactivatedMessage: 'Ang iyong account ay na-deactivate dahil bumaba ang iyong Fix-Score sa 50 points.',
    reactivateAccount: 'I-activate Muli ang Account',
    verifyAccount: 'Verify ang Account',
    verificationPending: 'Naghihintay ng Verification',
    verificationRejected: 'Tinanggihan ang Verification',
    accountSettings: 'Mga Setting ng Account',
    personalInfo: 'Personal na Impormasyon',
    changePassword: 'Baguhin ang Password',
    
    // Language Selection
    selectLanguage: 'Pumili ng Wika',
    english: 'Ingles',
    filipino: 'Filipino',
    languageChanged: 'Matagumpay na nabago ang wika',
    
    // Fix Score
    fixScoreTitle: 'Fix-Score',
    currentScore: 'Kasalukuyang Score',
    penalties: 'Mga Parusa',
    violations: 'Mga Paglabag',
    appeal: 'Mag-apela',
    history: 'Kasaysayan',
    
    // Reports
    reportType: 'Uri ng Ulat',
    bugReport: 'Ulat ng Bug',
    feedback: 'Feedback',
    complaint: 'Reklamo',
    description: 'Deskripsyon',
    attachImages: 'Mag-attach ng Larawan',
    
    // Ratings
    rateYourExperience: 'I-rate ang Iyong Karanasan',
    writeReview: 'Magsulat ng Review',
    rating: 'Rating',
    reviews: 'Mga Review',
    
    // Notifications
    notifications: 'Mga Notipikasyon',
    noNotifications: 'Walang notipikasyon',
    markAsRead: 'Markahan bilang Nabasa',
    
    // Errors & Alerts
    networkError: 'Error sa Network',
    somethingWentWrong: 'May nangyaring mali',
    pleaseCheckConnection: 'Pakicheck ang iyong koneksyon',
    sessionExpired: 'Nag-expire na ang Session',
    unauthorized: 'Walang Pahintulot',
    
    // Service Booking
    selectDate: 'Pumili ng Petsa',
    selectTime: 'Pumili ng Oras',
    selectLocation: 'Pumili ng Lokasyon',
    confirmBooking: 'Kumpirmahin ang Booking',
    bookingConfirmed: 'Nakumpirma ang Booking',
    bookingCancelled: 'Kinansela ang Booking',
    
    // Payment
    payment: 'Pagbabayad',
    paymentSuccessful: 'Matagumpay ang Pagbabayad',
    paymentFailed: 'Nabigo ang Pagbabayad',
    payNow: 'Magbayad Ngayon',
    paymentDetails: 'Detalye ng Pagbabayad',
  },
};

// Get translations for current language
export const getTranslations = (language: Language): Translations => {
  return translations[language] || translations.en;
};
