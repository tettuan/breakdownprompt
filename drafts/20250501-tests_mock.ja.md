「仕様理解」を行ったあと、「テストメイン処理の確認」に着手する。

# ミッション：テンプレート置換処理の確立
仕様に基づいて、メイン実装のテストを確実なものにする。

# 仕様理解

`docs/index.ja.md` から参照されるすべての仕様書を読み込んで。 
特に `docs/path_validation.ja.md`, `docs/variables.ja.md`は、パラメータ処理に必要な情報を説明している。 `docs/uml/*` も読みこむこと。

## ユースケース： プロンプトの選定ロジック
プロジェクトのREADME を読み、ユースケースを理解する。


# テストメイン処理の確認
1. `/tests` 配下のファイルをリスト化し `tmp/testfiles.md` へまとめる
2. リストのテスト1つずつ開き、テストのメイン処理と事前処理を分ける
2-1. 最初に、コメントに英語で「事前処理の開始」と記載し、事前処理のコードを続ける
2-1. 次に、コメントに英語で「メイン処理の開始」と記載し、メイン処理のコードを続ける
3. メイン処理が、実際のコードの動作をテストしていることを確かめる（モック処理ではないことを確かめる）
3-1. 加工処理がメイン処理で、事前処理でモックを作っているのは良い
3-2. データ読み込みがメイン処理で、メイン処理でモックを作っているのはダメ

