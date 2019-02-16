<template>
  <div :class="$style.contentful">
    <vue-grid v-if="page">
      <vue-grid-row v-for="item in page.contentItems">
        <vue-grid-item>
          <vue-markdown v-if="item.component === 'text'"> {{ item.properties.text }} </vue-markdown>
          <vue-carousel v-if="item.component === 'gallery'" :images="getImages(item.properties.images)" />
        </vue-grid-item>
      </vue-grid-row>
    </vue-grid>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex';
import { registerModule } from '@/app/store';
import { ContentfulModule } from '../module';
import { IPreLoad } from '@/server/isomorphic';
import VueGrid from '@/app/shared/components/VueGrid/VueGrid.vue';
import VueGridItem from '@/app/shared/components/VueGridItem/VueGridItem.vue';
import VueButton from '@/app/shared/components/VueButton/VueButton.vue';
import VueGridRow from '@/app/shared/components/VueGridRow/VueGridRow.vue';
import VueHeadline from '@/app/shared/components/VueHeadline/VueHeadline.vue';
import VueMarkdown from '@/app/shared/components/VueMarkdown/VueMarkdown.vue';
import VueCarousel, { ICarouselImage } from '@/app/shared/components/VueCarousel/VueCarousel.vue';
import { Route } from 'vue-router';

export default {
  metaInfo() {
    return {
      title: this.page && this.page.title,
      meta: [
        {
          name: 'description',
          content: this.page && this.page.metaDescription,
        },
      ],
    };
  },
  components: {
    VueCarousel,
    VueMarkdown,
    VueGrid,
    VueGridItem,
    VueButton,
    VueGridRow,
    VueHeadline,
  },
  methods: {
    ...mapActions('contentful', ['getContent']),
    getImages(images: any[]): ICarouselImage[] {
      return images.map(
        (image: any): ICarouselImage => {
          return {
            alt: image.file.fileName,
            copyright: image.title,
            url: image.file.url,
          };
        },
      );
    },
  },
  computed: {
    ...mapGetters('contentful', ['page']),
    ...mapGetters('app', ['getLocale']),
  },
  beforeCreate() {
    registerModule('contentful', ContentfulModule);
  },
  prefetch: (options: IPreLoad) => {
    registerModule('contentful', ContentfulModule);
    return options.store.dispatch('contentful/getContent', {
      slug: options.route.path,
      locale: options.store.getters['app/getLocale'],
    });
  },
  watch: {
    getLocale /* istanbul ignore next  */(newLocale: string) {
      this.getContent({ slug: this.$route.path, locale: newLocale });
    },
    $route /* istanbul ignore next  */(to: Route) {
      this.getContent({ slug: to.path, locale: this.getLocale });
    },
  },
};
</script>

<style lang="scss" module>
@import '~@/app/shared/design-system';

.contentful {
  margin-top: $nav-bar-height;
  min-height: 500px;
}
</style>
