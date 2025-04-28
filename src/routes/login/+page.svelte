
<section class="grid items-center justify-center h-screen">
    <div class="w-sm p-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm  dark:bg-gray-800 dark:border-gray-700">
      <div class="min-h-48">
        <form method="POST" class="flex flex-col justify-between h-full">
          <div class="mb-5">
            <p class="text-2xl text-gray-950 dark:text-gray-50">ورود به وبگاه</p>
          </div>
          <div>
            <div class="mb-5">
              <label for="email" class="mb-2">رایانامه</label>
              <input
                type="email"
                id="email"
                name="email"
                dir="ltr"
                placeholder="name@example.com" />
            </div>
            <div class="mb-5">
              <label for="password" class="mb-2">گذرواژه</label>
              <input
                type="password"
                id="password"
                name="password"
                dir="ltr"
              />
            </div>
            <div class='flex justify-end'>
              <button type="submit">ارسال</button>        
            </div>
        </form>
    </div>
  </section>
