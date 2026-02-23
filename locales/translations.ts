export const translations = {
  ar: {
    // Common
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    cancel: 'إلغاء',
    delete: 'حذف',
    save: 'حفظ',
    retry: 'إعادة المحاولة',
    showAll: 'عرض الكل',
    ok: 'حسناً',
    back: 'العودة',

    // Home Screen
    home: {
      noCountdowns: 'لا يوجد عد تنازلي',
      createFirst: 'أنشئ أول عد تنازلي لحدث مهم!',
      createCountdown: 'إنشاء عد تنازلي',
      addSalary: 'إضافة موعد راتب',
      salaryDate: 'موعد الراتب',
      deleteConfirmTitle: 'حذف العد التنازلي',
      deleteConfirmMessage: 'هل أنت متأكد من حذف "{title}"؟',
      noCategoryResults: 'لا يوجد عد تنازلي في هذه الفئة',
      addToFavorites: 'أضف للمفضلة',
      removeFromFavorites: 'إزالة من المفضلة',
    },

    // Salary Screen
    salary: {
      salaryDay: 'يوم الراتب',
      previewNextDate: 'معاينة الموعد القادم',
      createSalaryDate: 'إنشاء موعد الراتب',
      creating: 'جارٍ الإنشاء...',
      createError: 'فشل في إنشاء العد التنازلي',
      dateAdjusted: 'تم تعديل التاريخ بسبب نهاية الأسبوع',
      autoUpdateInfo: 'سيتم تحديث العد التنازلي تلقائياً للشهر التالي عند انتهاء الموعد',
    },

    // Calendar Picker
    calendar: {
      calendarType: 'نوع التقويم',
      gregorian: 'ميلادي',
      hijri: 'هجري',
      ifHoliday: 'إذا صادف الراتب يوم عطلة؟',
      weekendNote: 'العطلة في السعودية: الجمعة والسبت',
      adjustYes: 'نعم، عدّل الموعد',
      adjustYesDesc: 'الجمعة تُصرف الخميس، السبت تُصرف الأحد',
      adjustYesExample: 'مثال: راتب يوم ٢٥ (جمعة) ← تستلم الخميس ٢٤',
      adjustNo: 'لا، ابقِ الموعد كما هو',
      adjustNoDesc: 'حتى لو صادف يوم عطلة',
    },

    // Countdown Detail
    countdown: {
      deleteTitle: 'حذف العد التنازلي',
      deleteConfirm: 'هل أنت متأكد من حذف هذا العد التنازلي؟',
      notFound: 'العد التنازلي غير موجود',
      timeUp: 'حان الوقت!',
      completeButton: 'اكتمل! 🎊',
      shareMoment: 'شارك اللحظة',
      recurringCountdown: 'عد تنازلي متكرر',
      dayOfMonth: 'يوم الشهر:',
      calendar: 'التقويم:',
      weekendAdjustment: 'تعديل نهاية الأسبوع:',
    },

    // Edit
    edit: {
      title: 'تعديل العد التنازلي',
      saveButton: 'حفظ التغييرات',
      saving: 'جارٍ الحفظ...',
    },

    // Share
    share: {
      message: '{icon} العد التنازلي لـ {title}\n\n{time}\n\nشاركني العد على تطبيق نبّهني!',
      startCounting: 'ابدأ العد التنازلي معنا!',
      shareButton: 'شارك',
      fromPerson: 'عد تنازلي من {name}',
      addToMine: 'أضف لعداداتي',
      yourName: 'اسمك (اختياري)',
      namePlaceholder: 'مثال: محمد',
      shareThisMoment: 'شارك اللحظة!',
      countdownEnded: 'انتهى العد التنازلي!',
      celebrationTitle: 'حان الوقت!',
      shareAsImage: 'شارك كصورة',
      invalidLink: 'رابط غير صالح',
      invalidLinkMessage: 'هذا الرابط غير صالح أو انتهت صلاحيته',
      goToHome: 'العودة للرئيسية',
      added: 'تمت الإضافة!',
      addedMessage: 'تمت إضافة العد التنازلي إلى قائمتك',
      sharedCountdown: 'عد تنازلي مشترك',
    },

    // Language
    language: {
      changeTitle: 'تغيير اللغة',
      changeMessage: 'يجب إعادة تشغيل التطبيق لتطبيق التغييرات. هل تريد إعادة التشغيل الآن؟',
      later: 'لاحقاً',
      restart: 'إعادة التشغيل',
      restartRequired: 'إعادة التشغيل مطلوبة',
      restartManual: 'يرجى إغلاق التطبيق وإعادة فتحه لتطبيق التغييرات',
    },

    // Settings
    settings: {
      appearance: 'المظهر',
      displayMode: 'وضع العرض',
      light: 'فاتح',
      dark: 'داكن',
      auto: 'تلقائي',
      preferences: 'التفضيلات',
      notifications: 'الإشعارات',
      notificationsDesc: 'تلقي إشعار عند انتهاء العد',
      vibration: 'الاهتزاز',
      vibrationDesc: 'اهتزاز عند تحديث المؤقت',
      reminderTiming: 'توقيت التذكيرات',
      whenToRemind: 'متى تريد التذكير؟',
      aboutApp: 'حول التطبيق',
      rateApp: 'قيّم التطبيق',
      rateAppDesc: 'ساعدنا بتقييمك',
      contactUs: 'تواصل معنا',
      contactUsDesc: 'أرسل لنا ملاحظاتك',
      privacyPolicy: 'سياسة الخصوصية',
      restoreDesc: 'استعادة اشتراكك السابق',
      version: 'الإصدار',
      language: 'اللغة',
      selectLanguage: 'اختر اللغة',
      minReminderWarning: 'يجب اختيار توقيت تذكير واحد على الأقل',
      enableNotificationsPrompt: 'يرجى تفعيل الإشعارات من إعدادات الجهاز',
      openSettings: 'فتح الإعدادات',
      comingSoon: 'قريباً',
      rateNotAvailable: 'سيتوفر التقييم بعد نشر التطبيق في المتجر',
      cantOpenStore: 'لا يمكن فتح متجر التطبيقات',
      cantOpenEmail: 'لا يمكن فتح تطبيق البريد',
      cantOpenLink: 'لا يمكن فتح الرابط',
      appName: 'نبّهني - Nabbihni',
    },

    // Create Screen
    create: {
      title: 'عد تنازلي جديد',
      countdownTitle: 'عنوان العد التنازلي',
      titlePlaceholder: 'مثال: رحلة الصيف',
      dateTime: 'التاريخ والوقت',
      recurring: 'تكرار العد التنازلي',
      recurringDesc: 'يتجدد تلقائياً عند انتهاء العد',
      recurrenceType: 'نوع التكرار',
      dayOfWeek: 'يوم الأسبوع',
      recurringInfo: 'سيتم تحديث العد التنازلي تلقائياً عند انتهاء الموعد',
      createButton: 'إنشاء العد التنازلي',
      creating: 'جارٍ الإنشاء...',
      errorNoTitle: 'الرجاء إدخال عنوان للعد التنازلي',
      errorPastDate: 'الرجاء اختيار تاريخ في المستقبل',
      errorCreate: 'فشل في إنشاء العد التنازلي',
      note: 'ملاحظة',
      notePlaceholder: 'أضف ملاحظة أو تفاصيل إضافية...',
      noteOptional: '(اختياري)',
    },

    // Tabs
    tabs: {
      countdown: 'العد',
      myCountdowns: 'عداداتي',
      explore: 'اكتشف',
      publicEvents: 'أحداث عامة',
      settings: 'الإعدادات',
    },

    // Explore Screen
    explore: {
      all: 'الكل',
      religious: 'دينية',
      national: 'وطنية',
      seasonal: 'موسمية',
      entertainment: 'ترفيهية',
      milestone: 'إنجازات',
      education: 'تعليمية',
      international: 'دولي',
      noUpcomingEvents: 'لا توجد أحداث قادمة',
      confirmed: 'مؤكد',
      estimated: 'تقديري',
      tentative: 'مبدئي',
      moonSightingNote: 'قد يتغير بناءً على رؤية الهلال',
    },

    // Government Templates
    templates: {
      title: 'قوالب جاهزة',
      idCard: 'انتهاء الهوية',
      visa: 'انتهاء التأشيرة',
      vehicle: 'رخصة السيارة',
      passport: 'انتهاء جواز السفر',
      drivingLicense: 'رخصة القيادة',
      rent: 'موعد الإيجار',
      birthday: 'يوم ميلاد',
      birthdayPersonName: 'اسم صاحب عيد الميلاد',
      birthdayNamePlaceholder: 'مثال: سارة',
      expiryDate: 'تاريخ الانتهاء',
      createReminder: 'إنشاء تذكير',
      creating: 'جارٍ الإنشاء...',
      selectDate: 'اختر تاريخ الانتهاء',
      defaultReminders: 'التذكيرات الافتراضية',
      daysBeforeExpiry: 'أيام قبل الانتهاء',
    },

    // Theme Picker
    themePicker: {
      chooseTheme: 'اختر الثيم',
      freeThemes: '5 ثيمات مجانية',
      myWallpaper: 'خلفيتي',
      customWallpaperSelected: 'خلفية مخصصة مُختارة',
      chooseFromGallery: 'اختر صورة من معرض الصور',
      permissionRequired: 'الإذن مطلوب',
      permissionMessage: 'يرجى السماح بالوصول إلى معرض الصور لاختيار خلفية مخصصة.',
      ok: 'حسناً',
      customWallpaper: 'خلفية مخصصة',
      whatToDo: 'ماذا تريد أن تفعل؟',
      changeImage: 'تغيير الصورة',
      removeBackground: 'إزالة الخلفية',
      failedToPickImage: 'فشل في اختيار الصورة. يرجى المحاولة مرة أخرى.',
    },

    // Admin
    admin: {
      manageEvents: 'إدارة المناسبات',
    },

    // Reminders
    reminders: {
      atCompletion: 'عند الموعد',
      oneHour: 'باقي ساعة',
      oneDay: 'باقي يوم',
      oneWeek: 'باقي أسبوع',
      custom: 'مخصص',
      beforeMinutes: 'باقي {minutes} دقيقة',
      addCustom: 'إضافة تذكير مخصص',
      customReminderTitle: 'تذكير مخصص',
      days: 'أيام',
      hours: 'ساعات',
      minutes: 'دقائق',
      before: 'باقي',
      customFormat: 'باقي {time}',
      add: 'إضافة',
    },

    // Recurrence
    recurrence: {
      salary: 'راتب شهري',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      yearly: 'سنوي',
    },

    // Time Units
    timeUnits: {
      days: 'يوم',
      hours: 'ساعة',
      minutes: 'دقيقة',
      seconds: 'ثانية',
      and: ' و ',
    },

    // Emoji Categories
    emojiPicker: {
      chooseCategory: 'اختر الفئة',
      celebration: 'احتفال',
      love: 'حب',
      achievement: 'إنجاز',
      travel: 'سفر',
      spiritual: 'روحاني',
      work: 'عمل',
      study: 'دراسة',
      sports: 'رياضة',
      occasion: 'مناسبة',
      family: 'عائلة',
      financial: 'مالي',
      nature: 'طبيعة',
    },

    // Weekdays
    weekdays: {
      sun: 'الأحد',
      mon: 'الاثنين',
      tue: 'الثلاثاء',
      wed: 'الأربعاء',
      thu: 'الخميس',
      fri: 'الجمعة',
      sat: 'السبت',
    },

    // Subscription
    subscription: {
      premiumTitle: 'النسخة المميزة',
      subscribe: 'اشتراك',
      restorePurchases: 'استعادة المشتريات',
      youArePremium: 'أنت مشترك في النسخة المميزة',
      noAds: 'إزالة الإعلانات',
      unlimitedCountdowns: 'عدادات غير محدودة',
      allThemes: 'جميع الثيمات',
      loading: 'جارٍ التحميل...',
      restoreSuccess: 'تم استعادة المشتريات بنجاح',
      restoreNoSubscription: 'لم يتم العثور على اشتراك سابق',
      notActiveYet: 'الاشتراك غير مفعّل بعد. قريباً!',
      notAvailable: 'الاشتراك غير متاح حالياً. يرجى المحاولة لاحقاً',
      proFeature: 'ميزة برو ⭐',
      salaryPro: 'موعد الراتب المتكرر متاح للمشتركين في النسخة المميزة. يتم تحديثه تلقائياً كل شهر!',
      recurringPro: 'العد التنازلي المتكرر متاح للمشتركين في النسخة المميزة. يتجدد تلقائياً حسب التردد المحدد!',
      customWallpaperPro: 'خلفية مخصصة متاحة للمشتركين في النسخة المميزة.',
      later: 'لاحقاً',
      subscribeNow: 'اشترك الآن',
      limitReached: 'لقد وصلت للحد الأقصى (٥ عدادات)',
      upgradeNow: 'ترقية الآن',
      upgradeToCreate: 'قم بالترقية للنسخة المميزة لإنشاء عدادات غير محدودة',
    },

    // Paywall
    paywall: {
      // Dynamic headlines per trigger
      defaultHeadline: 'لا تفوّت ما يهمك أبداً',
      limitHeadline: 'توقف عن الحذف. ابدأ بالإنشاء.',
      salaryHeadline: 'افتح كل الميزات بلا حدود',
      recurringHeadline: 'اضبطه مرة. انساه للأبد.',
      wallpaperHeadline: 'اجعل كل عداد خاصاً بك',
      settingsHeadline: 'افتح كل الإمكانيات',
      subheadline: 'كل ما تحتاجه في اشتراك واحد',

      // Feature stack
      unlimitedTitle: 'عدادات غير محدودة',
      unlimitedDesc: 'تتبع كل لحظة مهمة',
      unlimitedBadge: '5 → ∞',
      salaryTitle: 'عداد الراتب الذكي',
      salaryDesc: 'يتحدث تلقائياً كل شهر',
      salaryBadge: '🔄 تلقائي',
      recurringTitle: 'عدادات متكررة',
      recurringDesc: 'يومي، أسبوعي، شهري، سنوي',
      recurringBadge: 'يومي•شهري',
      wallpaperTitle: 'خلفيات مخصصة',
      wallpaperDesc: 'استخدم صورك الخاصة',
      wallpaperBadge: '📸 صورك',
      adFreeTitle: 'بدون إعلانات',
      adFreeDesc: 'تجربة نقية بلا مقاطعات',
      adFreeBadge: '✓ نقي',
      priorityTitle: 'أولوية الميزات',
      priorityDesc: 'احصل على المزايا الجديدة أولاً',
      priorityBadge: 'VIP',

      // Pricing
      choosePlan: 'اختر خطتك',
      monthly: 'شهري',
      perMonth: '/شهر',
      lifetime: 'مدى الحياة',
      bestValue: 'أفضل قيمة',
      payOnceOwn: 'ادفع مرة، امتلك للأبد',
      savePercent: 'وفّر أكثر من 50%',
      monthlyEquivalent: 'فقط ٧ ر.س/شهر للأبد',

      // CTA
      unlockForever: 'افتح للأبد',
      subscribeNow: 'اشترك الآن',
      restorePurchases: 'استعادة المشتريات',

      // States
      purchasing: 'جارٍ الشراء...',
      success: 'تم بنجاح!',

      // Legal text (Apple requirement)
      legalAutoRenew: 'الاشتراك يتجدد تلقائياً ما لم يتم إلغاؤه قبل ٢٤ ساعة على الأقل من نهاية الفترة الحالية. يتم خصم المبلغ من حساب iTunes عند تأكيد الشراء.',
      legalLifetime: 'شراء لمرة واحدة. يتم خصم المبلغ من حساب iTunes عند تأكيد الشراء.',
      legalCancel: 'يمكنك إدارة اشتراكك وإلغاء التجديد التلقائي من إعدادات حسابك في App Store بعد الشراء.',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfUse: 'شروط الاستخدام',
    },

    // Errors
    errors: {
      networkError: 'خطأ في الاتصال',
      networkErrorDesc: 'فشل الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى',
      purchaseFailed: 'فشلت عملية الدفع',
      purchaseFailedDesc: 'حدث خطأ أثناء عملية الشراء. يرجى المحاولة مرة أخرى',
      purchaseCancelled: 'تم الإلغاء',
      purchaseCancelledDesc: 'تم إلغاء عملية الشراء',
      paymentPending: 'الدفع قيد المعالجة',
      paymentPendingDesc: 'عملية الدفع قيد المعالجة. سيتم تفعيل اشتراكك عند اكتمال الدفع',
      purchaseNotAllowed: 'الشراء غير متاح',
      purchaseNotAllowedDesc: 'عمليات الشراء غير مسموح بها على هذا الجهاز',
      productNotAvailable: 'المنتج غير متاح',
      productNotAvailableDesc: 'هذا الاشتراك غير متاح حالياً. يرجى المحاولة لاحقاً',
      receiptInUse: 'الحساب مستخدم',
      receiptInUseDesc: 'هذا الاشتراك مرتبط بحساب آخر. يرجى استعادة المشتريات من الحساب الصحيح',
      storeProblem: 'خطأ في المتجر',
      storeProblemDesc: 'حدث خطأ في متجر التطبيقات. يرجى المحاولة مرة أخرى',
      verificationError: 'خطأ في التحقق',
      verificationErrorDesc: 'فشل التحقق من عملية الشراء. يرجى المحاولة مرة أخرى',
      technicalError: 'خطأ تقني',
      technicalErrorDesc: 'حدث خطأ تقني. يرجى المحاولة لاحقاً أو التواصل مع الدعم',
    },

    // Notifications
    notifications: {
      channelName: 'تنبيهات نبّهني',
      reminderTitle: 'تنبيه: {title}',
      countdownEnded: 'حان الموعد!',
    },

    // Tasks
    tasks: {
      title: 'المهام',
      addPlaceholder: 'إضافة مهمة...',
      ready: 'جاهز!',
    },
  },

  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    retry: 'Retry',
    showAll: 'Show All',
    ok: 'OK',
    back: 'Back',

    // Home Screen
    home: {
      noCountdowns: 'No countdowns',
      createFirst: 'Create your first countdown for an important event!',
      createCountdown: 'Create Countdown',
      addSalary: 'Add Salary Date',
      salaryDate: 'Salary Date',
      deleteConfirmTitle: 'Delete Countdown',
      deleteConfirmMessage: 'Are you sure you want to delete "{title}"?',
      noCategoryResults: 'No countdowns in this category',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
    },

    // Salary Screen
    salary: {
      salaryDay: 'Salary Day',
      previewNextDate: 'Preview Next Date',
      createSalaryDate: 'Create Salary Date',
      creating: 'Creating...',
      createError: 'Failed to create countdown',
      dateAdjusted: 'Date adjusted due to weekend',
      autoUpdateInfo: 'Countdown will automatically update for the next month when the date passes',
    },

    // Calendar Picker
    calendar: {
      calendarType: 'Calendar Type',
      gregorian: 'Gregorian',
      hijri: 'Hijri',
      ifHoliday: 'If salary falls on a holiday?',
      weekendNote: 'Weekend in Saudi Arabia: Friday & Saturday',
      adjustYes: 'Yes, adjust the date',
      adjustYesDesc: 'Friday paid Thursday, Saturday paid Sunday',
      adjustYesExample: 'Example: salary day 25 (Friday) → receive Thursday 24',
      adjustNo: 'No, keep date as is',
      adjustNoDesc: 'Even if it falls on a holiday',
    },

    // Countdown Detail
    countdown: {
      deleteTitle: 'Delete Countdown',
      deleteConfirm: 'Are you sure you want to delete this countdown?',
      notFound: 'Countdown not found',
      timeUp: "Time's up!",
      completeButton: 'Complete! 🎊',
      shareMoment: 'Share the moment',
      recurringCountdown: 'Recurring Countdown',
      dayOfMonth: 'Day of month:',
      calendar: 'Calendar:',
      weekendAdjustment: 'Weekend adjustment:',
    },

    // Edit
    edit: {
      title: 'Edit Countdown',
      saveButton: 'Save Changes',
      saving: 'Saving...',
    },

    // Share
    share: {
      message: '{icon} Countdown to {title}\n\n{time}\n\nJoin me counting on Nabbihni!',
      startCounting: 'Start counting with us!',
      shareButton: 'Share',
      fromPerson: 'Countdown from {name}',
      addToMine: 'Add to My Countdowns',
      yourName: 'Your name (optional)',
      namePlaceholder: 'e.g., Mohammad',
      shareThisMoment: 'Share the moment!',
      countdownEnded: 'Countdown has ended!',
      celebrationTitle: "Time's up!",
      shareAsImage: 'Share as Image',
      invalidLink: 'Invalid Link',
      invalidLinkMessage: 'This link is invalid or has expired',
      goToHome: 'Go to Home',
      added: 'Added!',
      addedMessage: 'Countdown added to your list',
      sharedCountdown: 'Shared Countdown',
    },

    // Language
    language: {
      changeTitle: 'Language Change',
      changeMessage: 'The app needs to restart to apply changes. Restart now?',
      later: 'Later',
      restart: 'Restart',
      restartRequired: 'Restart Required',
      restartManual: 'Please close and reopen the app to apply changes',
    },

    // Settings
    settings: {
      appearance: 'Appearance',
      displayMode: 'Display Mode',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      preferences: 'Preferences',
      notifications: 'Notifications',
      notificationsDesc: 'Get notified when countdown ends',
      vibration: 'Vibration',
      vibrationDesc: 'Vibrate on timer update',
      reminderTiming: 'Reminder Timing',
      whenToRemind: 'When do you want to be reminded?',
      aboutApp: 'About',
      rateApp: 'Rate App',
      rateAppDesc: 'Help us with your rating',
      contactUs: 'Contact Us',
      contactUsDesc: 'Send us your feedback',
      privacyPolicy: 'Privacy Policy',
      restoreDesc: 'Restore your previous subscription',
      version: 'Version',
      language: 'Language',
      selectLanguage: 'Select Language',
      minReminderWarning: 'You must select at least one reminder timing',
      enableNotificationsPrompt: 'Please enable notifications from device settings',
      openSettings: 'Open Settings',
      comingSoon: 'Coming Soon',
      rateNotAvailable: 'Rating will be available after app is published',
      cantOpenStore: 'Cannot open App Store',
      cantOpenEmail: 'Cannot open email app',
      cantOpenLink: 'Cannot open link',
      appName: 'Nabbihni',
    },

    // Create Screen
    create: {
      title: 'New Countdown',
      countdownTitle: 'Countdown Title',
      titlePlaceholder: 'e.g., Summer Trip',
      dateTime: 'Date & Time',
      recurring: 'Recurring Countdown',
      recurringDesc: 'Automatically renews when countdown ends',
      recurrenceType: 'Recurrence Type',
      dayOfWeek: 'Day of Week',
      recurringInfo: 'Countdown will automatically update when the date passes',
      createButton: 'Create Countdown',
      creating: 'Creating...',
      errorNoTitle: 'Please enter a title for the countdown',
      errorPastDate: 'Please select a future date',
      errorCreate: 'Failed to create countdown',
      note: 'Note',
      notePlaceholder: 'Add a note or additional details...',
      noteOptional: '(optional)',
    },

    // Tabs
    tabs: {
      countdown: 'Countdown',
      myCountdowns: 'My Countdowns',
      explore: 'Explore',
      publicEvents: 'Public Events',
      settings: 'Settings',
    },

    // Explore Screen
    explore: {
      all: 'All',
      religious: 'Religious',
      national: 'National',
      seasonal: 'Seasonal',
      entertainment: 'Entertainment',
      milestone: 'Milestones',
      education: 'Education',
      international: 'International',
      noUpcomingEvents: 'No upcoming events',
      confirmed: 'Confirmed',
      estimated: 'Estimated',
      tentative: 'Tentative',
      moonSightingNote: 'May change based on moon sighting',
    },

    // Government Templates
    templates: {
      title: 'Quick Templates',
      idCard: 'ID Expiry',
      visa: 'Visa Expiry',
      vehicle: 'Vehicle Registration',
      passport: 'Passport Expiry',
      drivingLicense: 'Driving License',
      rent: 'Rent Payment',
      birthday: 'Birthday',
      birthdayPersonName: "Birthday person's name",
      birthdayNamePlaceholder: 'e.g. Sarah',
      expiryDate: 'Expiry Date',
      createReminder: 'Create Reminder',
      creating: 'Creating...',
      selectDate: 'Select expiry date',
      defaultReminders: 'Default Reminders',
      daysBeforeExpiry: 'days before expiry',
    },

    // Theme Picker
    themePicker: {
      chooseTheme: 'Choose Theme',
      freeThemes: '5 free themes',
      myWallpaper: 'My Wallpaper',
      customWallpaperSelected: 'Custom wallpaper selected',
      chooseFromGallery: 'Choose from photo gallery',
      permissionRequired: 'Permission Required',
      permissionMessage: 'Please allow access to photo gallery to choose a custom wallpaper.',
      ok: 'OK',
      customWallpaper: 'Custom Wallpaper',
      whatToDo: 'What would you like to do?',
      changeImage: 'Change Image',
      removeBackground: 'Remove Background',
      failedToPickImage: 'Failed to pick image. Please try again.',
    },

    // Admin
    admin: {
      manageEvents: 'Manage Events',
    },

    // Reminders
    reminders: {
      atCompletion: "It's time",
      oneHour: '1 hour left',
      oneDay: '1 day left',
      oneWeek: '1 week left',
      custom: 'Custom',
      beforeMinutes: '{minutes} minutes left',
      addCustom: 'Add custom reminder',
      customReminderTitle: 'Custom Reminder',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      before: 'left',
      customFormat: '{time} left',
      add: 'Add',
    },

    // Recurrence
    recurrence: {
      salary: 'Monthly Salary',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    },

    // Time Units
    timeUnits: {
      days: 'Days',
      hours: 'Hours',
      minutes: 'Min',
      seconds: 'Sec',
      and: ' & ',
    },

    // Emoji Categories
    emojiPicker: {
      chooseCategory: 'Choose Category',
      celebration: 'Celebration',
      love: 'Love',
      achievement: 'Achievement',
      travel: 'Travel',
      spiritual: 'Spiritual',
      work: 'Work',
      study: 'Study',
      sports: 'Sports',
      occasion: 'Occasion',
      family: 'Family',
      financial: 'Financial',
      nature: 'Nature',
    },

    // Weekdays
    weekdays: {
      sun: 'Sunday',
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
    },

    // Subscription
    subscription: {
      premiumTitle: 'Premium',
      subscribe: 'Subscribe',
      restorePurchases: 'Restore Purchases',
      youArePremium: 'You are a premium subscriber',
      noAds: 'Remove Ads',
      unlimitedCountdowns: 'Unlimited Countdowns',
      allThemes: 'All Themes',
      loading: 'Loading...',
      restoreSuccess: 'Purchases restored successfully',
      restoreNoSubscription: 'No previous subscription found',
      notActiveYet: 'Subscription not active yet. Coming soon!',
      notAvailable: 'Subscription not available. Please try again later',
      proFeature: 'Pro Feature ⭐',
      salaryPro: 'Recurring salary date is available for premium subscribers. Updates automatically every month!',
      recurringPro: 'Recurring countdown is available for premium subscribers. Renews automatically based on selected frequency!',
      customWallpaperPro: 'Custom wallpaper is available for premium subscribers.',
      later: 'Later',
      subscribeNow: 'Subscribe Now',
      limitReached: 'You have reached the limit (5 countdowns)',
      upgradeNow: 'Upgrade Now',
      upgradeToCreate: 'Upgrade to premium to create unlimited countdowns',
    },

    // Paywall
    paywall: {
      // Dynamic headlines per trigger
      defaultHeadline: 'Never miss what matters',
      limitHeadline: 'Stop deleting. Start creating.',
      salaryHeadline: 'Unlock all features, no limits',
      recurringHeadline: 'Set once. Forget forever.',
      wallpaperHeadline: 'Make every countdown yours',
      settingsHeadline: 'Unlock everything',
      subheadline: 'Everything you need in one plan',

      // Feature stack
      unlimitedTitle: 'Unlimited Countdowns',
      unlimitedDesc: 'Track every important moment',
      unlimitedBadge: '5 → ∞',
      salaryTitle: 'Smart Salary Tracker',
      salaryDesc: 'Auto-updates every month',
      salaryBadge: '🔄 Auto',
      recurringTitle: 'Recurring Countdowns',
      recurringDesc: 'Daily, weekly, monthly, yearly',
      recurringBadge: 'Daily•Monthly',
      wallpaperTitle: 'Custom Wallpapers',
      wallpaperDesc: 'Use your own photos',
      wallpaperBadge: '📸 Yours',
      adFreeTitle: 'Ad-Free',
      adFreeDesc: 'Pure experience, zero interruptions',
      adFreeBadge: '✓ Clean',
      priorityTitle: 'Priority Features',
      priorityDesc: 'Get new features first',
      priorityBadge: 'VIP',

      // Pricing
      choosePlan: 'Choose your plan',
      monthly: 'Monthly',
      perMonth: '/month',
      lifetime: 'Lifetime',
      bestValue: 'BEST VALUE',
      payOnceOwn: 'Pay once, own forever',
      savePercent: 'Save over 50%',
      monthlyEquivalent: 'Just 7 SAR/month forever',

      // CTA
      unlockForever: 'Unlock Forever',
      subscribeNow: 'Subscribe Now',
      restorePurchases: 'Restore Purchases',

      // States
      purchasing: 'Purchasing...',
      success: 'Success!',

      // Legal text (Apple requirement)
      legalAutoRenew: 'Subscription automatically renews unless canceled at least 24 hours before the end of the current period. Payment is charged to your iTunes account upon confirmation of purchase.',
      legalLifetime: 'One-time purchase. Payment is charged to your iTunes account upon confirmation of purchase.',
      legalCancel: 'You can manage your subscription and turn off auto-renewal from your App Store account settings after purchase.',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
    },

    // Errors
    errors: {
      networkError: 'Connection Error',
      networkErrorDesc: 'Failed to connect. Please check your connection and try again',
      purchaseFailed: 'Purchase Failed',
      purchaseFailedDesc: 'An error occurred during purchase. Please try again',
      purchaseCancelled: 'Cancelled',
      purchaseCancelledDesc: 'Purchase was cancelled',
      paymentPending: 'Payment Pending',
      paymentPendingDesc: 'Payment is being processed. Your subscription will activate once payment is complete',
      purchaseNotAllowed: 'Purchase Not Allowed',
      purchaseNotAllowedDesc: 'Purchases are not allowed on this device',
      productNotAvailable: 'Product Not Available',
      productNotAvailableDesc: 'This subscription is currently unavailable. Please try again later',
      receiptInUse: 'Account In Use',
      receiptInUseDesc: 'This subscription is linked to another account. Please restore purchases from the correct account',
      storeProblem: 'Store Error',
      storeProblemDesc: 'An error occurred with the app store. Please try again',
      verificationError: 'Verification Error',
      verificationErrorDesc: 'Failed to verify purchase. Please try again',
      technicalError: 'Technical Error',
      technicalErrorDesc: 'A technical error occurred. Please try again later or contact support',
    },

    // Notifications
    notifications: {
      channelName: 'Nabbihni Alerts',
      reminderTitle: 'Alert: {title}',
      countdownEnded: "Time's up!",
    },

    // Tasks
    tasks: {
      title: 'Tasks',
      addPlaceholder: 'Add a task...',
      ready: 'Ready!',
    },
  },
};

export type Language = 'ar' | 'en';
export type TranslationKeys = typeof translations.ar;
