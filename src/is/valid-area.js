
// determine if an <area> element is being properly used by and <img> via a <map>

import isVisible from './visible';
import getParents from '../get/parents';
import canFocusAreaImgTabindex from '../supports/focus-area-img-tabindex';
import canFocusAreaTabindex from '../supports/focus-area-tabindex';
import canFocusAreaWithoutHref from '../supports/focus-area-without-href';
import canFocusBrokenImageMaps from '../supports/focus-broken-image-map';
import {getImageOfArea} from './is.util';

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
// https://github.com/jquery/jquery-ui/blob/master/ui/core.js#L88-L107
export default function(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    throw new TypeError('is/valid-area requires an argument of type Element');
  }

  const nodeName = element.nodeName.toLowerCase();
  if (nodeName !== 'area') {
    return false;
  }

  const hasTabindex = element.hasAttribute('tabindex');
  if (!canFocusAreaTabindex && hasTabindex) {
    // Blink and WebKit do not consider <area tabindex="-1" href="#void"> focusable
    return false;
  }

  const img = getImageOfArea(element);
  if (!img || !isVisible(img)) {
    return false;
  }

  // Firefox only allows fully loaded images to reference image maps
  // https://stereochro.me/ideas/detecting-broken-images-js
  if (!canFocusBrokenImageMaps && (!img.complete || !img.naturalHeight || img.offsetWidth <= 0 || img.offsetHeight <= 0)) {
    return false;
  }

  // Firefox can focus area elements even if they don't have an href attribute
  if (!canFocusAreaWithoutHref && !element.href) {
    // Internet explorer can focus area elements without href if either
    // the area element or the image element has a tabindex attribute
    return canFocusAreaTabindex && hasTabindex || canFocusAreaImgTabindex && img.hasAttribute('tabindex');
  }

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  const childOfInteractive = getParents({context: img}).slice(1).some(function(_element) {
    const name = _element.nodeName.toLowerCase();
    return name === 'button' || name === 'a';
  });

  if (childOfInteractive) {
    return false;
  }

  return true;
}
