/* eslint-disable */
const libs = {
  portal: require("/lib/xp/portal"),
  content: require("/lib/xp/content"),
  context: require("/lib/xp/context"),
  util: require("/lib/util"),
  i18n: require("/lib/xp/i18n")
};

function hasModifyPermission(content) {
  const permissions = libs.content.getPermissions({
    key: content._id
  }).permissions;
  const principals = libs.context.get().authInfo.principals;

  if (principals.indexOf("role:system.admin") !== -1) return true;

  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i];

    if (permission.allow.indexOf("MODIFY") !== -1) {
      const modifyPrincipal = permission.principal;

      if (principals.indexOf(modifyPrincipal) !== -1) return true;

    }
  }
  return false;
};

exports.responseProcessor = (req, res) => {
  if (req.mode === "preview") {
    const content = libs.portal.getContent();
    if (hasModifyPermission(content)) {
      const siteConfig = libs.portal.getSiteConfig();
      const { position, size } = siteConfig;
      const { repository } = libs.context.get();
      const project = repository.split(".").pop();
      const contentUrl = `/admin/tool/com.enonic.app.contentstudio/main#/${project}/edit/${content._id}`;

      const locale = libs.portal.getSite().language || 'en';
      const buttonText = libs.i18n.localize({ key: "edit.button.text", locale })
      const editIconUrl = libs.portal.assetUrl({ path: "images/edit-button.svg" });

      const html = `<a href="${contentUrl}" class="contentStudio-link ${position.split("-").join(" ")} ${size} ${locale}" target="_blank">
        <img class="app-icon contentStudio-link__icon" src="${editIconUrl}">
        <span class="contentStudio-link__label">${buttonText}</span>
      </a>
      `;

      const cssUrl = libs.portal.assetUrl({ path: "css/app.css" });
      const css = `<link rel="preload" href="${cssUrl}" as="style">
        <link rel="stylesheet" href="${cssUrl}">
      `;

      res.pageContributions.bodyBegin = libs.util.data.forceArray(res.pageContributions.bodyBegin);
      res.pageContributions.bodyBegin.push(html);

      res.pageContributions.headEnd = libs.util.data.forceArray(res.pageContributions.headEnd);
      res.pageContributions.headEnd.push(css);
    }
  }
  return res;
};

