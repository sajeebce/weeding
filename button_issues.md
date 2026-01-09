🔍 Root Cause Analysis
1. Code Duplication - হ্যাঁ, আছে! ❌
তিনটা আলাদা জায়গায় craft button implementation:

Admin Preview (button-style-editor.tsx:348):


<ArrowUpRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />
Header CTAs (CTAButtons.tsx:41):


<ArrowUpRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />
Landing Hero (hero-cta-buttons.tsx:25):


<ArrowRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />
Same class string তিনবার copy-paste! Efficient reusability নাই।

2. Reusability Issue - আংশিক ⚠️
CraftButton component টা reusable, কিন্তু icon rotation logic বাইরে আছে।

সমস্যা:

Icon rotation এর CSS class প্রতিটা usage site এ manually add করতে হচ্ছে
CraftButtonIcon component এর মধ্যে built-in rotation থাকা উচিত ছিল
Centralized styling logic নাই
যা হওয়া উচিত ছিল:


// CraftButtonIcon component automatically handles rotation
<CraftButtonIcon>
  <ArrowRight />  {/* rotation automatic */}
</CraftButtonIcon>
3. Icon Rotation না কাজ করার মূল কারণ 🎯
আমি code comparison করে দেখেছি:

Admin Preview (Working):


<CraftButton>  {/* No asChild, direct button element */}
  <CraftButtonIcon>
    <ArrowUpRight className="group-hover:rotate-45" />
  </CraftButtonIcon>
</CraftButton>
→ DOM: <button class="group">...</button>

Landing Hero (Not Working):


<CraftButton asChild>
  <Link>  {/* Radix Slot replaces button with Link */}
    <CraftButtonIcon>
      <ArrowRight className="group-hover:rotate-45" />
    </CraftButtonIcon>
  </Link>
</CraftButton>
→ DOM: <a class="group">...</a>

Problem:
যখন asChild={true} এবং Link wrapper use করা হয়, Radix UI Slot component Link কে button এর জায়গায় swap করে। এতে:

React state based hover (background color change) কাজ করছে ✅
কিন্তু CSS group-hover: classes inconsistently apply হচ্ছে ❌
কারণ: CraftButtonIcon এর nested structure:


<span className="relative z-10">
  <span className="group-hover:scale-[15]">...</span>  ✅ Works
  <span className="group-hover:bg-zinc-900">
    <ArrowRight className="group-hover:rotate-45" />  ❌ Doesn't work
  </span>
</span>
Circle expansion এবং icon container color change কাজ করছে, কিন্তু icon rotation কাজ করছে না - এটা Radix Slot + Next.js Link এর combination এ CSS specificity/selector issue।

📋 Summary
Issue	Status	Impact
Code Duplication	❌ আছে	Maintainability খারাপ
Reusability	⚠️ আংশিক	Icon logic component বাইরে
Icon Rotation Bug	🐛 Bug	asChild + Link এ CSS issue
Solution approach থাকা উচিত:

Icon rotation logic CraftButtonIcon component এ centralize করা
asChild prop দিয়ে Link wrap করার সময় special handling দরকার
Shared utility function তৈরি করে duplicate code remove করা