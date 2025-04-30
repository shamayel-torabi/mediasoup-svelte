<script>
  let { message } = $props();
  const fa = new Intl.DateTimeFormat("fa-IR", {
    hour: "numeric",
    minute: "numeric",
  });
  const date = new Date(message.date);
  const timeStr = fa.format(date);
</script>

<li
  class="w-full mb-2 leading-1.5 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700"
>
  <div class="p-2">
    <div class="flex items-center gap-2 truncate">
      <!-- svelte-ignore a11y_img_redundant_alt -->
      <img
        class="w-8 h-8 rounded-full"
        src="/images/sham.jpg"
        alt="Sham image"
      />
      <div>
        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
          {timeStr}
        </p>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {message.userName}
        </p>
      </div>
    </div>
    <div class="p-2 truncate">
      <p class="text-sm font-normal text-gray-900 dark:text-white">
        {message.text}
      </p>
    </div>
  </div>
</li>
