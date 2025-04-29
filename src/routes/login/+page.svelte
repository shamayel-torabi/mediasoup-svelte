<script lang="ts">
  import type { PageProps } from "./$types";
  import { Card, Label, Input, Button } from "flowbite-svelte";
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>ورود</title>
  <meta name="description" content="Svelte Video Session app" />
</svelte:head>

<section class="grid items-center justify-center h-screen">
  <Card class="w-sm p-2">
    <form method="POST" class="space-y-6">
      <h5 class="text-xl font-medium text-gray-900 dark:text-white">
        ورود به وبگاه
      </h5>
      <div>
        <Label for="email">رایانامه</Label>
        <Input
          type="email"
          name="email"
          id="email"
          dir="ltr"
          value={form?.email ?? ""}
          placeholder="name@company.com"
        />
        {#if form?.emailMissing}<p class="mt3 text-red-600">
            رایانامه باید وارد شود
          </p>
        {/if}
      </div>
      <div>
        <Label for="password" class="mb-2">گذرواژه</Label>
        <Input type="password" id="password" name="password" dir="ltr" />
        {#if form?.passwordMissing}<p class="mt3 text-red-600">
            گذرواژه باید وارد شود
          </p>
        {/if}
        {#if form?.incorrect}
          <p class="text-red-600">رایانامه یا گذرواژه اشتباه است!</p>
        {/if}
      </div>
      <div class="grid justify-end">
        <Button type="submit">ارسال</Button>
      </div>
    </form>
  </Card>
</section>
