<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ShSiteFooter } from "@shakilabs/ui";
import { FOOTER_SECTIONS, POLICY_LINKS } from "@/data/footerNav";
import { BABY_BADGE_MESSAGE, CALCULATION_BASIS_NOTE } from "@/data/benefitRates2026";

const year = new Date().getFullYear();
const note = `${BABY_BADGE_MESSAGE} | ${CALCULATION_BASIS_NOTE}`;
</script>

<template>
  <ShSiteFooter
    app="baby"
    :sections="FOOTER_SECTIONS"
    :policy-links="POLICY_LINKS"
    :note="note"
    site-label="shakilabs.com/baby"
    :copyright="`Copyright © ${year} shakilabs.com`"
    :link-component="RouterLink"
  />
</template>
