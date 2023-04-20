var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import ADialog from './ADialog';
import { cssClass } from '../../styles';
import { debounce } from '../../internal';
/** @internal */
var SearchDialog = /** @class */ (function (_super) {
    __extends(SearchDialog, _super);
    function SearchDialog(column, dialog, provider) {
        var _this = _super.call(this, dialog, {
            livePreview: 'search',
        }) || this;
        _this.column = column;
        _this.provider = provider;
        return _this;
    }
    SearchDialog.prototype.build = function (node) {
        var _this = this;
        node.insertAdjacentHTML('beforeend', "<input type=\"text\" size=\"20\" value=\"\" required autofocus placeholder=\"search... (>= 3 chars)\">\n      <label class=\"".concat(cssClass('checkbox'), "\">\n        <input type=\"checkbox\">\n        <span>Use regular expressions</span>\n      </label>\n    "));
        var input = node.querySelector('input[type="text"]');
        var checkbox = node.querySelector('input[type="checkbox"]');
        var update = function () {
            var search = input.value;
            if (search.length < 3) {
                input.setCustomValidity('at least 3 characters');
                return;
            }
            input.setCustomValidity('');
        };
        input.addEventListener('input', update, {
            passive: true,
        });
        checkbox.addEventListener('change', update, {
            passive: true,
        });
        this.enableLivePreviews([input, checkbox]);
        if (!this.showLivePreviews()) {
            return;
        }
        input.addEventListener('input', debounce(function () { return _this.submit(); }, 100), {
            passive: true,
        });
    };
    SearchDialog.prototype.submit = function () {
        var input = this.findInput('input[type="text"]');
        var checkbox = this.findInput('input[type="checkbox"]');
        var search = input.value;
        var isRegex = checkbox.checked;
        if (isRegex) {
            search = new RegExp(search);
        }
        this.provider.searchAndJump(search, this.column);
        return true;
    };
    SearchDialog.prototype.reset = function () {
        var input = this.findInput('input[type="text"]');
        var checkbox = this.findInput('input[type="checkbox"]');
        input.value = '';
        checkbox.checked = false;
    };
    SearchDialog.prototype.cancel = function () {
        // nothing to do
    };
    return SearchDialog;
}(ADialog));
export default SearchDialog;
//# sourceMappingURL=SearchDialog.js.map