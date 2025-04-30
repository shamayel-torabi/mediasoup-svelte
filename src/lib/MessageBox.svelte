<script>

  let { message } = $props();
  const fa = new Intl.DateTimeFormat("fa-IR", {
    hour: "numeric",
    minute: "numeric",
  });
  const date = new Date(message.date);
  const timeStr = fa.format(date);
</script>

<li>
  <div class="flex items-start gap-2.5 mb-2">
    <!-- svelte-ignore a11y_img_redundant_alt -->
    <img
      class="w-8 h-8 rounded-full"
      src="/images/sham.jpg"
      alt="Jese image"
    />
    <div
      class="flex flex-col w-[16rem] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700"
    >
      <div
        class="flex items-center justify-between space-x-2 rtl:space-x-reverse"
      >
        <span class="text-sm font-semibold text-gray-900 dark:text-white"
          >{message.userName}</span
        >
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400"
          >{timeStr}</span
        >
      </div>
      <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
        {message.text}
      </p>
    </div>
  </div>
</li>
